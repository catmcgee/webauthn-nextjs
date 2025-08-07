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
// TODO function to register options
export async function regOptions(username: string) {}

/**
 * Verify the client's response to a registration ceremony
 *
 * @param username - Username associated with the registration attempt
 * @param body - The response JSON returned by WebAuthn client
 * @returns `true` if the response is valid and stored in memory, if not `false`
 */
// TODO function to verify registration
export async function regVerify(
  username: string,
  body: RegistrationResponseJSON
) {}

/**
 * Generate WebAuthn authentication options (assertion challenge)
 *
 * @param username - Username whose credentials should be allowed
 * @returns Options that should be passed to `navigator.credentials.get`
 */
// TODO function to generate authentication options
export async function authOptions(username: string) {}

/**
 * Verify the client's response to authentication (login)
 *
 * @param username - Username attempting to authenticate/login
 * @param body - The response JSON returned by WebAuthn
 * @returns `true` if the assertion is valid, else `false`
 */
// TODO function to verify authentication
export async function authVerify(
  username: string,
  body: AuthenticationResponseJSON
) {}
