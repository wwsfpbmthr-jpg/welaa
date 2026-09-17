export async function POST() {
  return Response.json(
    { error: 'ระบบอัปโหลดกำลังเชื่อมต่อกับพื้นที่จัดเก็บ Production' },
    { status: 503 },
  );
}
