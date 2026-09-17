export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(
    {
      user: null,
      spaces: [],
      occupied: [],
      availability: [],
      bookings: [],
      favorites: [],
      messages: [],
      reviews: [],
      draft: null,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST() {
  return Response.json(
    { error: 'ฟังก์ชันบัญชีและการจองกำลังเชื่อมต่อกับระบบ Production' },
    { status: 503 },
  );
}
