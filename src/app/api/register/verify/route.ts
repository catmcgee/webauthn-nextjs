import { NextResponse } from "next/server";
import { regVerify } from "@/lib/webauthn";

// Handles verification of the client's passkey registration
export async function POST(req: Request) {
  const data = await req.json();
  const ok = await regVerify(data.username, data.credential);
  return NextResponse.json({ verified: ok });
}
