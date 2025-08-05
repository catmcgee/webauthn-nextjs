import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/types';
import { db } from './passkeys';
import { Buffer } from 'buffer';

const rpName = process.env.NEXT_PUBLIC_RP_NAME!;
const rpID   = process.env.NEXT_PUBLIC_RP_ID!;
const origin = process.env.NEXT_PUBLIC_ORIGIN!;

export async function regOptions(username: string) {
  const userID = Buffer.from(username, 'utf8'); 
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID,
    userName: username,
    attestationType: 'none',
    excludeCredentials: (db.store.get(username) || []).map(p => ({
    id: p.id,
      transports: ['internal', 'hybrid', 'usb'] as AuthenticatorTransportFuture[],
    })),
  });
  db.regChal.set(username, options.challenge);
  return options;
}

export async function regVerify(
  username: string,
  body: RegistrationResponseJSON,
) {
  const expectedChallenge = db.regChal.get(username) ?? "";
  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  console.log("verification", verification);

  if (verification.verified) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const info = verification.registrationInfo as any;
    const id = info.credential.id;
    const credentialPublicKey = info.credential.publicKey;
    const counter = info.credential.counter;

    console.log("info",info)

    const entry = {
      id,
      publicKey: credentialPublicKey,
      counter,
    };
    db.store.set(username, [...(db.store.get(username) || []), entry]);

    console.log("entry", entry)
  }

  return verification.verified;
}

export async function authOptions(username: string) {
  const allowCredentials = (db.store.get(username) || []).map(p => ({
    id: p.id,
    transports: ['internal', 'hybrid', 'usb'] as AuthenticatorTransportFuture[],
  }));

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials,
  });

  db.authChal.set(username, options.challenge);
  return options;
}

export async function authVerify(
  username: string,
  body: AuthenticationResponseJSON,
) {
  const expectedChallenge = db.authChal.get(username) ?? "";

  const creds = (db.store.get(username) || []).find(c => c.id === body.id);
  if (!creds) return false;

  console.log("creds", creds)

  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      publicKey: creds.publicKey,
      counter: creds.counter,
      id: creds.id,
      transports: ['internal', 'hybrid', 'usb'] as AuthenticatorTransportFuture[],
    },
  });

  if (verification.verified && verification.authenticationInfo) {
    creds.counter = verification.authenticationInfo.newCounter;
  }
  return verification.verified;
}
