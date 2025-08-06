/**
 * In-memory storage utilities for passkey registration and authentication.
 * A restart wipes everything; don't use in prod
 */

export type Passkey = {
  // TODO add fields we store in the db
};

/**
 * Map of user → registered passkeys
 */
const store = new Map<string, Passkey[]>();
const registerChallenge = new Map<string, string>(); // registration challenge per user
const authChallenge = new Map<string, string>(); // auth challenge per user

export const db = { store, registerChallenge, authChallenge };
