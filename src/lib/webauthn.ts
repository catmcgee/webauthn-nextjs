/**
 * WebAuthn helper functions for server-side registration and authentication
 * using WebAuthn API
 *
 * All credential data and challenges are stored in memory via the `db`
 * object in `passkeys.ts`. Don't use this in production :)
 */
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from "@simplewebauthn/types";
import { db } from "./passkeys";
import { Buffer } from "buffer";

const rpName = process.env.NEXT_PUBLIC_RP_NAME!;
const rpID = process.env.NEXT_PUBLIC_RP_ID!;
const origin = process.env.NEXT_PUBLIC_ORIGIN!;

/**
 * Generate WebAuthn registration options for the user
 *
 * @param username - A username, also used as user handle
 * @returns Options that should be passed to `navigator.credentials.create`
 */
export async function regOptions(username: string) {
  const userID = Buffer.from(username, "utf8");
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID,
    userName: username,
    attestationType: "none",
    excludeCredentials: (db.store.get(username) || []).map((p) => ({
      id: p.id,
    })),
    supportedAlgorithmIDs: [-7],
  });
  db.regChal.set(username, options.challenge);
  return options;
}

/**
 * Verify the client's response to a registration ceremony
 *
 * @param username - Username associated with the registration attempt
 * @param body - The response JSON returned by WebAuthn client
 * @returns `true` if the response is valid and stored in memory, if not `false`
 */
export async function regVerify(
  username: string,
  body: RegistrationResponseJSON
) {
  const expectedChallenge = db.regChal.get(username) ?? "";
  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  if (verification.verified && verification.registrationInfo) {
    const { credential } = verification.registrationInfo;
    const { id, publicKey: credentialPublicKey, counter } = credential;

    const entry = {
      id,
      publicKey: credentialPublicKey,
      counter,
    };
    db.store.set(username, [...(db.store.get(username) || []), entry]);
  }

  return verification.verified;
}

/**
 * Generate WebAuthn authentication options (assertion challenge)
 *
 * @param username - Username whose credentials should be allowed
 * @returns Options that should be passed to `navigator.credentials.get`
 */
export async function authOptions(username: string) {
  const allowCredentials = (db.store.get(username) || []).map((p) => ({
    id: p.id,
  }));

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials,
  });

  db.authChal.set(username, options.challenge);
  return options;
}

/**
 * Verify the client's response to authentication (login)
 *
 * @param username - Username attempting to authenticate/login
 * @param body - The response JSON returned by WebAuthn
 * @returns `true` if the assertion is valid, else `false`
 */
export async function authVerify(
  username: string,
  body: AuthenticationResponseJSON
) {
  const expectedChallenge = db.authChal.get(username) ?? "";

  const creds = (db.store.get(username) || []).find((c) => c.id === body.id);
  if (!creds) return false;

  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      publicKey: creds.publicKey,
      counter: creds.counter,
      id: creds.id,
    },
  });

  if (verification.verified && verification.authenticationInfo) {
    creds.counter = verification.authenticationInfo.newCounter;
  }
  return verification.verified;
}
