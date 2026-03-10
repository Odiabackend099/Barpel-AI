import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: 'No backend URL configured' }, { status: 500 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`${backendUrl}/health`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);
    return NextResponse.json({ status: 'ok', backend: res.ok });
  } catch {
    return NextResponse.json({ status: 'ok', backend: false });
  }
}
