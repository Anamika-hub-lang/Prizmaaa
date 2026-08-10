-- Reliable account deletion for Clerk users (run once in Supabase SQL Editor).
-- Used by POST /api/user/delete-account via purge_clerk_user().

create or replace function public.purge_clerk_user(p_clerk_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_clerk_id is null or length(trim(p_clerk_id)) = 0 then
    raise exception 'clerk_id is required';
  end if;

  delete from public.student_enrollments where clerk_id = p_clerk_id;

  begin
    delete from public.cashfree_order_intents where clerk_id = p_clerk_id;
  exception
    when undefined_table then
      null;
  end;

  delete from public.profiles where clerk_id = p_clerk_id;
end;
$$;

revoke all on function public.purge_clerk_user(text) from public;
grant execute on function public.purge_clerk_user(text) to service_role;
