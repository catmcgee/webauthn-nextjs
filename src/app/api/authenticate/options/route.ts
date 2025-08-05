import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/webauthn';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('u') ?? 'Alice';
  return NextResponse.json(await authOptions(user));
}
