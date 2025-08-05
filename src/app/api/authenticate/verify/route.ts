import { NextResponse } from "next/server";
import { authVerify } from "@/lib/webauthn";

// Handles verification of the client's authentication
export async function POST(req: Request) {
  const data = await req.json();
  const ok = await authVerify(data.username, data.credential);
  return NextResponse.json({ verified: ok });
}
