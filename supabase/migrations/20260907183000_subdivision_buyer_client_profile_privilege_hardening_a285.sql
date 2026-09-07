-- A285: impede invocação direta de leitura cadastral; somente o adaptador servidor pode executar a função protegida.

revoke all on function public.subdivision_get_draft_buyer_client_profile(uuid, uuid, public.operating_module, text, uuid)
  from public, anon, authenticated;

grant execute on function public.subdivision_get_draft_buyer_client_profile(uuid, uuid, public.operating_module, text, uuid)
  to service_role;
