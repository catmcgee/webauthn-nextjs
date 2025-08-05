// src/app/api/authenticate/verify/route.ts
import { NextResponse } from 'next/server';
import { authVerify } from '@/lib/webauthn';

export async function POST(req: Request) {
  try {
    const { username, credential } = await req.json();
    const ok = await authVerify(username, credential);
    return NextResponse.json({ verified: ok });
  } catch (err) {
    console.error(err);                       
    return NextResponse.json(
      { verified: false, error: (err as Error).message },
      { status: 400 },
    );
  }
}