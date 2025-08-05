import { NextResponse } from "next/server";
import { regOptions } from "@/lib/webauthn";

// Generates WebAuthn registration options (challenge) for the client
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("u") ?? "Alice";
  return NextResponse.json(await regOptions(user));
}
