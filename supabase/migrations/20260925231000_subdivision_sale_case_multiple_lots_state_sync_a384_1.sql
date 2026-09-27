-- A384.1: ponte preservativa para procedures históricas que ainda escrevem o lote legado.
-- Propaga estado comercial para a coleção sem duplicar venda, agenda ou itens nominais.

create or replace function private.sync_subdivision_sale_case_lot_commercial_state()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if pg_catalog.pg_trigger_depth() > 1 then
    return coalesce(new, old);
  end if;
  if tg_op = 'DELETE' then
    if old.sale_case_id is not null then
      delete from public.subdivision_lot_commercial_states state
       where state.organization_id = old.organization_id
         and state.sale_case_id = old.sale_case_id;
    end if;
    return old;
  end if;
  if new.sale_case_id is not null then
    insert into public.subdivision_lot_commercial_states(
      organization_id, lot_id, sale_case_id, commercial_state, created_by
    )
    select link.organization_id, link.lot_id, new.sale_case_id,
           new.commercial_state, new.created_by
      from public.subdivision_sale_case_lots link
     where link.organization_id = new.organization_id
       and link.sale_case_id = new.sale_case_id
    on conflict (organization_id, lot_id) do update
      set sale_case_id = excluded.sale_case_id,
          commercial_state = excluded.commercial_state,
          created_by = excluded.created_by,
          updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists subdivision_sale_case_lot_commercial_state_sync
  on public.subdivision_lot_commercial_states;
create trigger subdivision_sale_case_lot_commercial_state_sync
after insert or update or delete on public.subdivision_lot_commercial_states
for each row execute function private.sync_subdivision_sale_case_lot_commercial_state();

create or replace function private.delete_subdivision_sale_case_lot_links_before_case_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.subdivision_sale_case_lots link
   where link.organization_id = old.organization_id
     and link.sale_case_id = old.id;
  return old;
end;
$$;

drop trigger if exists subdivision_sale_case_lot_links_before_case_delete
  on public.subdivision_sale_cases;
create trigger subdivision_sale_case_lot_links_before_case_delete
before delete on public.subdivision_sale_cases
for each row execute function private.delete_subdivision_sale_case_lot_links_before_case_delete();

create or replace function private.deny_subdivision_lot_reservation_when_sale_active()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.subdivision_lot_has_active_sale(new.organization_id, new.lot_id) then
    raise exception using
      errcode = '42501',
      message = 'SUBDIVISION_LOT_PHYSICAL_RESERVATION_CONFLICT';
  end if;
  return new;
end;
$$;

drop trigger if exists subdivision_lot_reservation_sale_case_guard
  on public.subdivision_lot_physical_reservations;
create trigger subdivision_lot_reservation_sale_case_guard
before insert or update on public.subdivision_lot_physical_reservations
for each row execute function private.deny_subdivision_lot_reservation_when_sale_active();

comment on function private.sync_subdivision_sale_case_lot_commercial_state() is
  'A384.1: ponte dos estados comerciais do lote legado para todos os lotes da mesma venda; sem criar item nominal por lote.';
