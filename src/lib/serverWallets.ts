import { PrivyClient } from "@privy-io/server-auth";

export const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

const walletCache = new Map<string, { id: string; address: string }>();

/**
 * Get/create a privy server wallet
 */
export async function getOrCreateServerWallet(userId: string) {
  const cached = walletCache.get(userId);
  if (cached) return cached;

  const { id, address } = await privy.walletApi.createWallet({
    chainType: "ethereum",
  });

  const record = { id, address } as const;
  walletCache.set(userId, record);
  return record;
}
