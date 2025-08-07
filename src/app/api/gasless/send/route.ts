import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { sendGaslessEth } from "@/lib/smartAccount";

export async function POST(req: Request) {
  const userId = (await headers()).get("x-privy-user-id");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing x-privy-user-id header" },
      { status: 400 }
    );
  }

  const { to, amountEth } = (await req.json()) as {
    to: string;
    amountEth: string;
  };

  if (!to || !amountEth) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const txHash = await sendGaslessEth(
      userId,
      to as `0x${string}`,
      BigInt(Math.floor(parseFloat(amountEth) * 10 ** 18))
    );
    return NextResponse.json({ txHash });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Tx failed" }, { status: 500 });
  }
}
