"use client";
import { useEffect } from "react";
/** Public geometry only, mounted exclusively in the existing non-production QA workspace. */
export function PreviewTelemetry() {
  useEffect(() => {
    if (window.self === window.top) return;
    const send = () =>
      window.parent.postMessage(
        {
          type: "welaa-preview-layout",
          width: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
        },
        "*",
      );
    const observer = new ResizeObserver(send);
    observer.observe(document.documentElement);
    observer.observe(document.body);
    window.addEventListener("resize", send);
    send();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", send);
    };
  }, []);
  return null;
}
