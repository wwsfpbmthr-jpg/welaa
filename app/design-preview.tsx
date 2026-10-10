"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
const widths = [375, 390, 768, 1024, 1440];
const routes = [
  ["/", "หน้าแรก"],
  ["/explore", "สำรวจ"],
  ["/search", "ค้นหา"],
  ["/become-a-host", "เจ้าของพื้นที่"],
  ["/help", "ช่วยเหลือ"],
  ["/account/bookings", "บัญชี"],
  ["/login", "เข้าสู่ระบบ"],
];
/** Existing preview-only workspace. iframe width is the actual responsive viewport. */
export default function DesignPreview() {
  const [width, setWidth] = useState(390),
    [route, setRoute] = useState("/");
  const frame = useRef<HTMLIFrameElement>(null);
  const [measurement, setMeasurement] = useState<{
    width: number;
    scrollWidth: number;
  } | null>(null);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.source !== frame.current?.contentWindow ||
        event.data?.type !== "welaa-preview-layout"
      )
        return;
      const { width, scrollWidth } = event.data;
      if (Number.isFinite(width) && Number.isFinite(scrollWidth))
        setMeasurement({ width, scrollWidth });
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  return (
    <div className="design-preview-workspace">
      <header>
        <div>
          <b>WELAA 2.0</b>
          <span>ตรวจดีไซน์ · เฉพาะ Preview</span>
        </div>
        <label>
          หน้าที่ตรวจ{" "}
          <select
            aria-label="หน้าที่ตรวจ"
            value={route}
            onChange={(e) => setRoute(e.target.value)}
          >
            {routes.map(([path, label]) => (
              <option key={path} value={path}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div
          className="design-device-switch"
          role="group"
          aria-label="ขนาดหน้าจอ"
        >
          {widths.map((w) => (
            <button
              key={w}
              aria-pressed={width === w}
              onClick={() => setWidth(w)}
            >
              {w}px
            </button>
          ))}
        </div>
        <Link href={route} target="_blank">
          เปิดหน้า <ArrowUpRight size={16} />
        </Link>
      </header>
      <output
        data-testid="viewport-measurement"
        className="v2-preview-measurement"
      >
        {measurement
          ? `Viewport ${measurement.width}px · Content ${measurement.scrollWidth}px · ${measurement.scrollWidth > measurement.width ? "มี horizontal overflow" : "ไม่มี horizontal overflow"}`
          : "กำลังตรวจ viewport…"}
      </output>
      <div className="design-preview-canvas">
        <iframe
          ref={frame}
          title="พรีวิว WELAA"
          src={route}
          style={{ width, height: 900 }}
        />
      </div>
    </div>
  );
}
