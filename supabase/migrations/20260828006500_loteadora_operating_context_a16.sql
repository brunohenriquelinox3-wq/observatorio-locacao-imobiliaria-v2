-- A16 — Extensão explícita do contexto operacional para Loteadora.
-- Não cria grants, memberships, organizações, Parties, loteamentos ou dados de negócio.

alter type public.operating_module add value if not exists 'loteadora';

comment on type public.operating_module is
  'Módulos operacionais explícitos. A presença do valor não concede acesso: a autorização exige identidade, membership, grant, vigência, finalidade e seletor de escopo.';
