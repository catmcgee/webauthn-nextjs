import { NextResponse } from "next/server";
import { getOrCreateServerWallet } from "@/lib/serverWallets";
import { headers } from "next/headers";

/**
 * returns server wallet
 * in production you'd verify an auth token instead
 */
export async function GET() {
  const userId = (await headers()).get("x-privy-user-id");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing x-privy-user-id header" },
      { status: 400 }
    );
  }

  try {
    const wallet = await getOrCreateServerWallet(userId);
    return NextResponse.json({ address: wallet.address });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
