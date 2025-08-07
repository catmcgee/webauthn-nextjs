import { createPublicClient, http } from "viem";
import { createViemAccount } from "@privy-io/server-auth/viem";
import { getOrCreateServerWallet, privy } from "./serverWallets";
import { baseSepolia } from "viem/chains";
import { createSmartAccountClient } from "permissionless";
import { entryPoint07Address } from "viem/account-abstraction";
import { toKernelSmartAccount } from "permissionless/accounts";

/**
 * Build a SmartAccountClient that sponsors gas using Pimlico paymaster
 * sorry i got lazy here with typescript
 */

const BUNDLER_URL = process.env.BUNDLER_URL as string;
const PAYMASTER_URL = process.env.PAYMASTER_URL as string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clientCache = new Map<string, any>();

export async function getSmartAccountClient(userId: string) {
  const cached = clientCache.get(userId);
  if (cached) return cached;

  const { id: walletId, address } = await getOrCreateServerWallet(userId);

  // create viem LocalAccount for privy server wallet
  const serverWalletAccount = await createViemAccount({
    walletId,
    address: address as `0x${string}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    privy: privy as any,
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const kernelSmartAccount = await toKernelSmartAccount({
    client: publicClient,
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
    owners: [serverWalletAccount],
  });

  const { createPimlicoClient } = await import(
    "permissionless/clients/pimlico"
  ).catch(() => ({ createPimlicoClient: () => undefined }));

  const paymasterClient = createPimlicoClient?.({
    transport: http(PAYMASTER_URL),
    entryPoint: kernelSmartAccount.entryPoint,
  });

  const smartAccountClient = createSmartAccountClient({
    account: kernelSmartAccount,
    chain: baseSepolia,
    paymaster: paymasterClient,
    bundlerTransport: http(BUNDLER_URL),
    userOperation: {
      estimateFeesPerGas: async () => {
        const gasPrices = await paymasterClient?.getUserOperationGasPrice?.();
        if (!gasPrices) {
          throw new Error("Paymaster unavailable");
        }
        return gasPrices.fast;
      },
    },
  });

  clientCache.set(userId, smartAccountClient);
  return smartAccountClient;
}

export async function sendGaslessEth(
  userId: string,
  to: `0x${string}`,
  valueWei: bigint
) {
  const smartAccountClient = await getSmartAccountClient(userId);
  return smartAccountClient.sendTransaction({
    to,
    value: valueWei,
  });
}
