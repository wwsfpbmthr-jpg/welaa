"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight, MapPin, ChevronRight } from "lucide-react";
import { useApp } from "../context";
import { cities } from "../data";
import { SpaceCard, Empty, SectionHead, DataUnavailable } from "../ui";
import { SearchBox, SpaceSkeletons } from "./search-box";
import { activities, collections, publishedSpaces } from "./catalog";

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="v2-breadcrumb" aria-label="เส้นทางหน้า">
      {items.map((x, i) => (
        <span key={x.label}>
          {i > 0 && <ChevronRight size={12} />}{" "}
          {x.href ? (
            <Link href={x.href}>{x.label}</Link>
          ) : (
            <span aria-current="page">{x.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
export function ActivityCards() {
  return (
    <div className="v2-activities">
      {activities.map((a) => (
        <Link
          href={"/explore/activity/" + a.slug}
          className="v2-activity"
          key={a.slug}
        >
          <div>
            <Image
              src={a.image}
              alt=""
              fill
              sizes="(max-width:640px) 50vw, 25vw"
            />
            <span>{a.label}</span>
          </div>
          <h3>
            {a.name}
            <ArrowUpRight size={18} />
          </h3>
          <p>{a.description}</p>
        </Link>
      ))}
    </div>
  );
}
export function CollectionCards() {
  return (
    <div className="v2-collections">
      {collections.map((c) => (
        <Link
          className="v2-collection"
          key={c.slug}
          href={"/explore/collection/" + c.slug}
        >
          <div>
            <Image
              src={c.image}
              alt=""
              fill
              sizes="(max-width:640px) 90vw, 33vw"
            />
          </div>
          <small>WELAA COLLECTION</small>
          <h3>
            {c.name}
            <ArrowUpRight size={18} />
          </h3>
          <p>{c.description}</p>
        </Link>
      ))}
    </div>
  );
}
export function CityLinks() {
  const { all, ready, dataError } = useApp();
  const spaces = publishedSpaces(all);
  const options = [...new Set([...cities, ...spaces.map((s) => s.city)])];
  return (
    <div className="v2-cities">
      {options.map((city) => (
        <Link href={"/explore/city/" + encodeURIComponent(city)} key={city}>
          <MapPin size={19} />
          <div>
            <h3>{city}</h3>
            <small>
              {dataError
                ? "ข้อมูลยังไม่พร้อม"
                : ready
                  ? `${spaces.filter((s) => s.city === city).length} พื้นที่เผยแพร่`
                  : "กำลังตรวจพื้นที่…"}
            </small>
          </div>
          <ArrowUpRight size={18} />
        </Link>
      ))}
    </div>
  );
}
export function DiscoverHome() {
  const { all, ready, dataError } = useApp();
  const spaces = publishedSpaces(all).slice(0, 4);
  return (
    <div className="v2-home">
      <section className="v2-hero">
        <div className="v2-hero-copy">
          <span className="eyebrow">SPACE FOR WHAT’S NEXT</span>
          <h1>
            พื้นที่ดี ๆ<br />
            สำหรับทุก<span>ความเป็นไปได้</span>
          </h1>
          <p>
            ประชุม สร้างคอนเทนต์ หรือรวมผู้คน
            <br />
            ค้นพบพื้นที่ที่พอดี แล้วเลือกใช้เท่าที่ต้องการ
          </p>
          <Link href="/explore" className="v2-text-link">
            ค้นพบพื้นที่ในแบบของคุณ <ArrowRight size={18} />
          </Link>
        </div>
        <div className="v2-hero-photo">
          <Image
            src="/photos/meeting.jpg"
            alt="ภาพประกอบพื้นที่ประชุมที่มีแสงธรรมชาติ"
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            preload
          />
          <span>
            MAKE ROOM FOR YOUR IDEAS<small>ภาพประกอบแนวคิดการใช้พื้นที่</small>
          </span>
        </div>
      </section>
      <section className="v2-home-search" aria-label="ค้นหาพื้นที่">
        <SearchBox hero />
      </section>
      <section className="v2-section">
        <SectionHead
          eyebrow="FIND YOUR PURPOSE"
          title="วันนี้คุณอยากทำอะไร?"
          sub="เริ่มจากกิจกรรม แล้วสำรวจพื้นที่ที่เหมาะกับคุณ"
          href="/explore"
        />
        <ActivityCards />
      </section>
      <section className="v2-section">
        <SectionHead
          eyebrow="SPACES ON WELAA"
          title="พื้นที่ที่เพิ่งเผยแพร่"
          sub="รายละเอียดจากเจ้าของพื้นที่ ราคาและเวลาว่างตรวจสอบก่อนจอง"
          href="/search"
        />
        {!ready ? (
          <SpaceSkeletons />
        ) : dataError ? (
          <DataUnavailable />
        ) : spaces.length ? (
          <div className="space-grid">
            {spaces.map((s) => (
              <SpaceCard s={s} key={s.id} />
            ))}
          </div>
        ) : (
          <Empty
            title="ยังไม่มีพื้นที่เผยแพร่ในขณะนี้"
            sub="สำรวจหมวดกิจกรรมได้ หรือเป็นเจ้าของพื้นที่รายแรกของ WELAA"
          >
            <Link href="/become-a-host" className="button secondary">
              รู้จักการปล่อยพื้นที่ <ArrowUpRight size={16} />
            </Link>
          </Empty>
        )}
      </section>
      <section className="v2-section">
        <SectionHead
          eyebrow="A DIFFERENT WAY TO DISCOVER"
          title="เริ่มต้นด้วยไอเดีย"
          sub="คอลเลกชันคัดตามรายละเอียดพื้นที่จริง ไม่ใช่อันดับความนิยม"
          href="/explore"
        />
        <CollectionCards />
      </section>
      <section className="v2-section">
        <SectionHead
          eyebrow="EXPLORE BY CITY"
          title="พื้นที่ใกล้ชีวิตของคุณ"
          sub="เลือกเมืองเพื่อดูพื้นที่ที่เผยแพร่ จำนวนอัปเดตจากระบบจริง"
        />
        <CityLinks />
      </section>
      <section className="v2-section v2-how">
        <div>
          <span className="eyebrow">LESS FRICTION. MORE POSSIBILITY.</span>
          <h2>
            จากไอเดีย
            <br />
            สู่พื้นที่ของคุณ
          </h2>
          <Link href="/how-it-works" className="v2-text-link">
            ดูวิธีใช้งาน <ArrowRight size={18} />
          </Link>
        </div>
        <ol>
          {[
            ["ค้นหาพื้นที่", "เลือกกิจกรรม เมือง และจำนวนคน"],
            ["เลือกช่วงเวลา", "ดูเวลาว่าง กฎ และยอดรวมก่อนส่งคำขอ"],
            ["รอเจ้าของยืนยัน", "ติดตามสถานะได้ในการจองของฉัน"],
          ].map((x, i) => (
            <li key={x[0]}>
              <span>0{i + 1}</span>
              <div>
                <h3>{x[0]}</h3>
                <p>{x[1]}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="v2-section v2-host-banner">
        <div>
          <span className="eyebrow">FOR SPACE OWNERS</span>
          <h2>
            พื้นที่ว่างของคุณ
            <br />
            อาจเป็นจุดเริ่มต้นของใครอีกคน
          </h2>
          <p>
            กำหนดรายละเอียด ราคา และช่วงเวลา
            <br />
            จัดการคำขอจองได้จากศูนย์เจ้าของพื้นที่
          </p>
          <Link className="button" href="/become-a-host">
            รู้จักการปล่อยพื้นที่ <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="v2-host-photo">
          <Image
            src="/photos/workspace.jpg"
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            alt="ภาพประกอบพื้นที่สำหรับทำงาน"
          />
        </div>
      </section>
      <section className="v2-section v2-trust">
        <div>
          <span className="eyebrow">CLARITY BUILDS CONFIDENCE</span>
          <h2>ความมั่นใจ เริ่มจากข้อมูลที่ชัดเจน</h2>
          <p>
            ตรวจรายละเอียด กฎ และช่วงเวลาก่อนจอง ขณะนี้ WELAA
            ยังไม่มีการรับเงินจริงและยังไม่เปิดระบบยืนยันตัวตน
          </p>
        </div>
        <Link className="button secondary" href="/trust-and-safety">
          อ่านข้อควรรู้ <ArrowRight size={17} />
        </Link>
      </section>
    </div>
  );
}
export function Explore({ path }: { path: string }) {
  const { all, ready, dataError } = useApp();
  const parts = path.split("/");
  const kind = parts[2];
  const slug = decodeURIComponent(parts[3] || "");
  const activity = activities.find((a) => a.slug === slug);
  const collection = collections.find((c) => c.slug === slug);
  const city = kind === "city" ? slug : "";
  const isRoot = path === "/explore";
  const valid =
    isRoot ||
    !!(kind === "activity" && activity) ||
    !!(kind === "collection" && collection) ||
    !!city;
  if (!valid)
    return (
      <div className="page">
        <Empty title="ไม่พบหมวดนี้">
          <Link href="/explore" className="button">
            กลับไปสำรวจ
          </Link>
        </Empty>
      </div>
    );
  const title = isRoot
    ? "พื้นที่ใหม่ ๆ สำหรับไอเดียของคุณ"
    : kind === "activity"
      ? activity!.title
      : kind === "collection"
        ? collection!.name
        : `สำรวจพื้นที่ใน${city}`;
  const description = isRoot
    ? "เลือกจากสิ่งที่อยากทำ เมืองที่อยากไป หรือรายละเอียดที่คุณให้ความสำคัญ"
    : kind === "activity"
      ? activity!.description
      : kind === "collection"
        ? collection!.description
        : "ค้นหาพื้นที่รายชั่วโมงที่เผยแพร่ในเมืองนี้";
  const spaces = publishedSpaces(all).filter((s) =>
    isRoot
      ? true
      : kind === "activity"
        ? s.activities.includes(activity!.name)
        : kind === "collection"
          ? collection!.match(s)
          : s.city === city,
  );
  const search = city
    ? "/search?city=" + encodeURIComponent(city)
    : activity
      ? "/search?cat=" + encodeURIComponent(activity.name)
      : collection?.slug === "small-teams"
        ? "/search?cat=" + encodeURIComponent("ประชุม")
        : collection
          ? "/search?amenities=" +
            encodeURIComponent(
              collection.slug === "daylight" ? "แสงธรรมชาติ" : "ที่จอดรถ",
            )
          : "/search";
  return (
    <div className="page v2-explore">
      <Breadcrumbs
        items={[
          { label: "หน้าหลัก", href: "/" },
          { label: "สำรวจ", href: isRoot ? undefined : "/explore" },
          ...(!isRoot
            ? [{ label: city || activity?.name || collection!.name }]
            : []),
        ]}
      />
      <header className="v2-page-heading">
        <span className="eyebrow">DISCOVER WELAA</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link className="v2-text-link" href={search}>
          ค้นหาและเลือกวันเวลา <ArrowRight size={18} />
        </Link>
      </header>
      {isRoot ? (
        <>
          <section className="v2-block">
            <SectionHead title="เลือกจากกิจกรรม" />
            <ActivityCards />
          </section>
          <section className="v2-block">
            <SectionHead title="เลือกจากไอเดีย" />
            <CollectionCards />
          </section>
          <section className="v2-block">
            <SectionHead title="สำรวจตามเมือง" />
            <CityLinks />
          </section>
        </>
      ) : (
        <section className="v2-block">
          <div className="section-head">
            <h2>พื้นที่ในหมวดนี้</h2>
            <span role="status">
              {ready ? `${spaces.length} พื้นที่` : "กำลังโหลด…"}
            </span>
          </div>
          {!ready ? (
            <SpaceSkeletons />
          ) : dataError ? (
            <DataUnavailable />
          ) : spaces.length ? (
            <div className="space-grid">
              {spaces.map((s) => (
                <SpaceCard key={s.id} s={s} />
              ))}
            </div>
          ) : (
            <Empty
              title="ยังไม่มีพื้นที่ในหมวดนี้"
              sub="ดูหมวดอื่น หรือค้นหาจากทุกเมืองเพื่อสำรวจต่อ"
            >
              <Link className="button secondary" href="/search">
                ดูพื้นที่ทั้งหมด
              </Link>
            </Empty>
          )}
          <div className="v2-related">
            <h3>สำรวจต่อ</h3>
            {activities
              .filter((a) => a.slug !== slug)
              .map((a) => (
                <Link key={a.slug} href={"/explore/activity/" + a.slug}>
                  {a.name}
                  <ArrowUpRight size={15} />
                </Link>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
