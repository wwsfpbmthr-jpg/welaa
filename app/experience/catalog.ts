import type { Space } from "../data";
export const activities = [
  {
    slug: "meetings",
    name: "ประชุม",
    title: "พื้นที่สำหรับบทสนทนาที่ไปต่อ",
    description:
      "ห้องประชุมและพื้นที่ทำงาน สำหรับคุยงาน วางแผน และแลกเปลี่ยนไอเดีย",
    image: "/photos/meeting.jpg",
    label: "MEET & WORK",
  },
  {
    slug: "content",
    name: "ถ่าย Content",
    title: "ให้ไอเดียของคุณมีพื้นที่",
    description:
      "สำรวจสตูดิโอและพื้นที่สำหรับสร้างภาพ ถ่ายวิดีโอ และทำคอนเทนต์",
    image: "/photos/studio.jpg",
    label: "CREATE & CAPTURE",
  },
  {
    slug: "workshops",
    name: "เวิร์กช็อป",
    title: "พื้นที่ที่การเรียนรู้เกิดขึ้น",
    description: "พื้นที่สำหรับสอน ลงมือทำ และแบ่งปันความรู้ร่วมกัน",
    image: "/photos/workspace.jpg",
    label: "LEARN & SHARE",
  },
  {
    slug: "events",
    name: "จัดกิจกรรม",
    title: "รวมผู้คน สร้างช่วงเวลาที่มีค่า",
    description:
      "พื้นที่สำหรับกิจกรรมกลุ่มและงานพบปะ เลือกความจุและกฎให้เหมาะกับงาน",
    image: "/photos/event.jpg",
    label: "GATHER & CONNECT",
  },
] as const;
export const collections = [
  {
    slug: "daylight",
    name: "ให้แสงธรรมชาติเล่าเรื่อง",
    description: "พื้นที่ที่เจ้าของระบุว่ามีแสงธรรมชาติ",
    image: "/photos/studio.jpg",
    match: (s: Space) => s.amenities.includes("แสงธรรมชาติ"),
  },
  {
    slug: "small-teams",
    name: "ไอเดียใหญ่ เริ่มจากทีมเล็ก",
    description: "พื้นที่สำหรับประชุมที่รองรับตั้งแต่ 2 ถึง 12 คน",
    image: "/photos/meeting.jpg",
    match: (s: Space) =>
      s.activities.includes("ประชุม") && s.guests >= 2 && s.guests <= 12,
  },
  {
    slug: "easy-arrival",
    name: "เดินทางพร้อมกันได้สะดวก",
    description: "พื้นที่ที่เจ้าของระบุว่ามีที่จอดรถ",
    image: "/photos/cafe.jpg",
    match: (s: Space) => s.amenities.includes("ที่จอดรถ"),
  },
];
export function publishedSpaces(spaces: Space[]) {
  return spaces.filter((s) => s.status === "published");
}
