-- A294: leitura agregada de atenção da agenda interna. Não infere pagamento, não cobra e não dispara comunicação.
create function public.subdivision_list_internal_receivable_attention(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text) returns table(contract_preparation_id uuid, due_within_four_days_count integer, past_due_unreconciled_count integer) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_RECEIVABLE_ATTENTION_CONTEXT_DENIED'; end if;
  return query select contract.id, count(schedule.id) filter (where schedule.due_date between current_date and current_date + 4)::integer, count(schedule.id) filter (where schedule.due_date < current_date)::integer from public.subdivision_sale_contract_preparations contract left join public.subdivision_sale_receivable_schedules schedule on schedule.organization_id = contract.organization_id and schedule.contract_preparation_id = contract.id and schedule.bank_issuance_state = 'awaiting_bank_issue' where contract.organization_id = p_organization_id and contract.state <> 'archived' group by contract.id order by contract.updated_at desc, contract.id;
end; $$;
revoke all on function public.subdivision_list_internal_receivable_attention(uuid,uuid,public.operating_module,text) from public, anon, authenticated;
grant execute on function public.subdivision_list_internal_receivable_attention(uuid,uuid,public.operating_module,text) to service_role;
