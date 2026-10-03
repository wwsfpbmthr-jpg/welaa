create table public.demo_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete restrict,
  renter_id uuid not null references auth.users(id) on delete restrict,
  amount integer not null check (amount > 0),
  currency text not null default 'THB' check (currency = 'THB'),
  method text not null check (method in ('card','promptpay')),
  mode text not null default 'test' check (mode = 'test'),
  created_at timestamptz not null default now()
);
alter table public.demo_payments enable row level security;
grant select, insert on public.demo_payments to authenticated;
revoke all on public.demo_payments from anon;
create policy demo_payment_parties_read on public.demo_payments for select to authenticated using (
  renter_id = (select auth.uid()) or exists (select 1 from public.bookings b join public.listings l on l.id=b.listing_id where b.id=booking_id and l.owner_id=(select auth.uid()))
);
create policy demo_payment_renter_insert on public.demo_payments for insert to authenticated with check (
  renter_id=(select auth.uid()) and mode='test' and exists (
    select 1 from public.bookings b where b.id=booking_id and b.renter_id=(select auth.uid()) and b.status='confirmed' and b.total=amount
  )
);
create schema if not exists private;
-- Narrow trigger validates against, and locks, a booking without granting clients booking UPDATE rights.
create function private.validate_demo_payment() returns trigger language plpgsql security definer set search_path='' as $$
declare b public.bookings%rowtype;
begin
  if auth.uid() is null or new.renter_id<>auth.uid() then raise exception 'Sign in is required'; end if;
  select * into b from public.bookings where id=new.booking_id for update;
  if b.id is null or b.renter_id<>auth.uid() then raise exception 'Booking not found'; end if;
  if b.status<>'confirmed' then raise exception 'Owner approval is required before payment'; end if;
  if (b.booking_date + make_interval(hours=>b.start_hour::integer)) <= (now() at time zone 'Asia/Bangkok') then raise exception 'Booking has already started'; end if;
  if new.amount<>b.total then raise exception 'Payment amount does not match booking'; end if;
  new.created_at:=now();
  return new;
end;
$$;
revoke all on function private.validate_demo_payment() from public,anon,authenticated;
create trigger validate_demo_payment before insert on public.demo_payments for each row execute function private.validate_demo_payment();
create function public.complete_demo_payment(p_booking_id uuid,p_method text) returns uuid language plpgsql security invoker set search_path='' as $$
declare b public.bookings%rowtype; payment_id uuid;
begin
  if auth.uid() is null then raise exception 'Sign in is required'; end if;
  if p_method is null or p_method not in ('card','promptpay') then raise exception 'Choose card or PromptPay'; end if;
  select * into b from public.bookings where id=p_booking_id and renter_id=auth.uid();
  if b.id is null then raise exception 'Booking not found'; end if;
  select id into payment_id from public.demo_payments where booking_id=p_booking_id;
  if payment_id is not null then return payment_id; end if;
  insert into public.demo_payments(booking_id,renter_id,amount,method) values(b.id,auth.uid(),b.total,p_method) on conflict(booking_id) do nothing returning id into payment_id;
  if payment_id is null then select id into payment_id from public.demo_payments where booking_id=p_booking_id; end if;
  return payment_id;
end;
$$;
revoke all on function public.complete_demo_payment(uuid,text) from public,anon;
grant execute on function public.complete_demo_payment(uuid,text) to authenticated;
