create or replace function public.request_booking_reviewed(
  p_listing_id uuid, p_date date, p_start_hour smallint, p_end_hour smallint,
  p_guest_count integer, p_expected_total integer
) returns uuid language plpgsql security invoker set search_path = public, pg_temp as $$
declare v_id uuid; v_total integer;
begin
  if auth.uid() is null then raise exception 'กรุณาเข้าสู่ระบบก่อนจอง'; end if;
  if p_expected_total is null or p_expected_total <= 0 then raise exception 'กรุณาตรวจราคาใหม่'; end if;
  if p_date is null or p_start_hour is null or
    (p_date + make_interval(hours => p_start_hour::integer)) <= (now() at time zone 'Asia/Bangkok') then
    raise exception 'กรุณาเลือกเวลาในอนาคต';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text || ':' || p_listing_id::text || ':' || p_date::text || ':' || p_start_hour::text || ':' || p_end_hour::text, 0));
  select id, total into v_id, v_total from public.bookings
    where renter_id = auth.uid() and listing_id = p_listing_id
      and booking_date = p_date and start_hour = p_start_hour and end_hour = p_end_hour
      and guest_count = p_guest_count and status in ('pending','confirmed')
    order by created_at desc limit 1;
  if v_id is not null then
    if v_total <> p_expected_total then raise exception 'ราคาเปลี่ยน กรุณาตรวจรายการจองของคุณ'; end if;
    return v_id;
  end if;
  v_id := public.request_booking(p_listing_id,p_date,p_start_hour,p_end_hour,p_guest_count);
  select total into v_total from public.bookings where id = v_id and renter_id = auth.uid();
  if v_total is null or v_total <> p_expected_total then
    raise exception 'ราคาเปลี่ยน กรุณาตรวจยอดใหม่ก่อนยืนยัน';
  end if;
  return v_id;
end;
$$;
revoke all on function public.request_booking_reviewed(uuid,date,smallint,smallint,integer,integer) from public, anon;
grant execute on function public.request_booking_reviewed(uuid,date,smallint,smallint,integer,integer) to authenticated;
