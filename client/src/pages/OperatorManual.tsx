import DashboardLayout from "@/components/DashboardLayout";
import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  GraduationCap,
  Handshake,
  Landmark,
  Lightbulb,
  ListChecks,
  LockKeyhole,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import "../operator-manual.css";

type RoleKey = "admin" | "finance" | "sales" | "broker" | "legal" | "permutant" | "partners";
type ManualTrack = {
  key: RoleKey;
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof BriefcaseBusiness;
  color: string;
  lessons: string[];
};

type Lesson = {
  id: string;
  number: string;
  title: string;
  audience: string;
  duration: string;
  description: string;
  steps: string[];
  observe: string;
  avoid: string;
  link?: string;
  screen: "context" | "lot" | "sale" | "finance" | "partners" | "client";
};

const accessGate = {
  eyebrow: "MANUAL OPERACIONAL · APRENDA ANTES DE OPERAR",
  title: "Aprenda o CRM com calma, clareza e prática.",
  description: "O Manual do Operador reúne trilhas por função, passos simples, telas demonstrativas e regras de segurança para que cada pessoa saiba o que fazer antes de usar uma ferramenta real.",
  routeTitle: "Rota de treinamento",
  routeDetail: "perfil → módulo → passo → conferência",
  actionLabel: "Entrar com Google",
  footerLabel: "PRIMEIRO CONTATO",
  footerValue: "APRENDER · PRATICAR · OPERAR",
  footerNote: "O treinamento não altera cadastros, vendas ou financeiro.",
  railTop: "GUIA",
  railBottom: "OPERAÇÃO",
};

const tracks: ManualTrack[] = [
  { key: "admin", eyebrow: "TRILHA 01", title: "Administrativo", description: "Organizações, colaboradores, acessos, cadastros e rotina de governança.", icon: BriefcaseBusiness, color: "blue", lessons: ["Entrar e escolher o contexto", "Cadastrar colaborador com segurança", "Liberar somente módulos desenvolvidos"] },
  { key: "finance", eyebrow: "TRILHA 02", title: "Financeiro", description: "Controle interno de parcelas, atenção diária e leitura segura de vencimentos.", icon: WalletCards, color: "green", lessons: ["Ler o lote interno", "Entender o lembrete de atenção", "O que o CRM não faz"] },
  { key: "sales", eyebrow: "TRILHA 03", title: "Gerente de vendas", description: "Acompanhar a jornada comercial sem perder proponentes, negociação ou documentação.", icon: CreditCard, color: "orange", lessons: ["Abrir uma preparação de venda", "Revisar negociação", "Confirmar somente após conferência"] },
  { key: "broker", eyebrow: "TRILHA 04", title: "Corretor", description: "Consultar estoque, localizar cliente e preparar informações para o responsável.", icon: UsersRound, color: "purple", lessons: ["Encontrar lote disponível", "Localizar cliente", "Enviar informação para revisão"] },
  { key: "legal", eyebrow: "TRILHA 05", title: "Jurídico e contábil", description: "Revisar documentos, pendências e histórico interno sem confundir controle com emissão.", icon: FileCheck2, color: "red", lessons: ["Ler dossiê privado", "Conferir pendências", "Registrar orientação interna"] },
  { key: "permutant", eyebrow: "TRILHA 06", title: "Permutante", description: "Acessar somente o painel destinado ao acompanhamento da sua participação.", icon: Handshake, color: "teal", lessons: ["Entrar no painel", "Ler informações permitidas", "Pedir correção pelo canal certo"] },
  { key: "partners", eyebrow: "TRILHA 07", title: "Sócios e parceiros", description: "Entender vínculos, regras internas e participação por empreendimento ou lote.", icon: Landmark, color: "gold", lessons: ["Ler o vínculo", "Entender vigência", "Revisar projeções internas"] },
];

const lessons: Lesson[] = [
  { id: "context", number: "01", title: "Entrar, escolher o contexto e reconhecer a tela", audience: "Todos os perfis", duration: "4 min", description: "Antes de abrir qualquer setor, confirme sua conta Google, a organização e a finalidade exibida. A tela certa começa pelo contexto certo.", steps: ["Entre com a conta Google de trabalho autorizada.", "Escolha BHL Imóveis quando ela aparecer em Organização autorizada.", "Confira Módulo e Finalidade antes de continuar.", "Use a navegação lateral: Loteadora, Central de Vendas, Sócios e Parceiros, Financeiro e Manual do Operador."], observe: "A mensagem de contexto confirmado indica que o servidor ainda verifica identidade, vínculo, alçada e finalidade em cada leitura.", avoid: "Não compartilhe login, QR code, senha ou sessão. E-mail sozinho não concede acesso.", screen: "context" },
  { id: "lot", number: "02", title: "Cadastrar e consultar um loteamento", audience: "Administrativo · gerente · corretor", duration: "8 min", description: "O loteamento é a fonte física do estoque. Quadras, lotes, medidas, preços e documentos ficam organizados no mesmo empreendimento.", steps: ["Abra Loteamentos e localize o empreendimento.", "Confira a identidade, localização e pendências de documentação.", "Entre em Quadras e lotes para consultar a matriz física.", "Leia área, preço por m², valor do lote, situação e observações.", "Use Editar somente com dados conferidos e autorização da sua função."], observe: "Campos pendentes não são erro automaticamente: alguns aguardam documento ou conferência humana.", avoid: "Não crie quadra ou lote duplicado para corrigir uma informação. Primeiro pesquise e abra o registro existente.", link: "/loteadora", screen: "lot" },
  { id: "sale", number: "03", title: "Preparar uma venda com segurança", audience: "Gerente de vendas · corretor", duration: "12 min", description: "A Central de Vendas reúne lote, cliente, proponentes, negociação e dossiê. A confirmação final é uma etapa separada e exige revisão.", steps: ["Abra Nova venda na Central de Vendas.", "Busque o loteamento pelo nome e selecione quadra e lote.", "Busque o cliente por nome, CPF ou CNPJ; um resultado único é vinculado automaticamente.", "Adicione proponentes conjuntos quando necessário.", "Preencha modalidade, entrada, parcelas e datas conforme o acordo.", "Revise o dossiê e só então avance para confirmação."], observe: "Enquanto a venda está em preparação, os valores podem ser revisados; a confirmação é o ponto que marca o estoque e organiza o lote interno de parcelas.", avoid: "Não confirme uma venda para testar botão. Use sempre a simulação deste manual ou peça autorização para uma operação real.", link: "/loteadora/vendas", screen: "sale" },
  { id: "finance", number: "04", title: "Ler o Financeiro da Loteadora", audience: "Financeiro · administrativo · gerente", duration: "7 min", description: "O Financeiro do CRM é um controle interno. Ele organiza o lote de parcelas e lembra o operador sobre a atenção necessária.", steps: ["Abra Financeiro e confira o contexto autorizado.", "Leia os lotes internos de parcelas liberados por venda aprovada.", "Observe a configuração de antecedência do lembrete.", "Use a atenção diária para orientar cobrança manual pela equipe.", "Registre a ocorrência no processo interno da empresa, se essa for sua rotina."], observe: "O CRM não emite boleto bancário, não envia mensagem externa, não acessa banco, não dá baixa e não registra pagamento.", avoid: "Nunca trate um lembrete como confirmação de pagamento ou quitação.", link: "/loteadora/financeiro", screen: "finance" },
  { id: "client", number: "05", title: "Localizar e completar um Cliente Loteadora", audience: "Administrativo · gerente · corretor", duration: "8 min", description: "O cadastro reúne identificação, contatos, documentos, pendências e participantes relacionados sem duplicar a pessoa.", steps: ["Abra Clientes e documentos.", "Pesquise por nome, telefone ou referência permitida na tela.", "Abra a ficha única do cliente e confira os dados já informados.", "Complete somente o campo necessário para a finalidade declarada.", "Anexe documentos pelo fluxo privado e confira a pendência gerada."], observe: "Cliente cadastrado não significa cliente vendido. O cadastro permanece separado de lote, contrato e financeiro.", avoid: "Não crie outro cadastro só porque faltou um campo na ficha existente.", link: "/loteadora/clientes", screen: "client" },
  { id: "partners", number: "06", title: "Entender Sócios e Parceiros", audience: "Administrativo · sócio · jurídico · contábil", duration: "9 min", description: "As regras de participação são internas, versionadas e ligadas ao loteamento, lote e item da negociação quando aplicável.", steps: ["Abra Sócios e Parceiros.", "Localize o vínculo do participante e leia sua vigência.", "Confira se a regra é percentual, fixa, limitada ou seletiva.", "Entenda o resumo projetado sem confundir projeção com pagamento.", "Encaminhe divergências para revisão responsável."], observe: "O CRM registra projeções internas; não executa split bancário, ordem de pagamento ou transferência.", avoid: "Não informe que um valor foi pago apenas porque aparece como projeção no CRM.", link: "/loteadora/socios-parceiros", screen: "partners" },
];

const quickRules = [
  { icon: ShieldCheck, title: "Identidade antes de privilégio", text: "Login Google abre a sessão; organização, módulo, finalidade e alçada continuam sendo conferidos." },
  { icon: ClipboardCheck, title: "Conferir antes de confirmar", text: "Leia lote, cliente, valores, documentos e participantes antes de qualquer ação material." },
  { icon: LockKeyhole, title: "Controle interno", text: "O CRM orienta a operação da empresa. Ele não substitui banco, contrato assinado ou conferência humana." },
];

function ScreenMockup({ type }: { type: Lesson["screen"] }) {
  const content = {
    context: { label: "CONTEXTO DE TRABALHO", title: "Acesso delimitado antes da leitura.", fields: [["Organização autorizada", "BHL Imóveis"], ["Módulo", "Loteadora"], ["Finalidade", "OPERAÇÃO INTERNA"]], accent: "context" },
    lot: { label: "LOTEAMENTOS · MATRIZ FÍSICA", title: "Vista do Sol · Quadras e lotes", fields: [["Quadra", "Quadra 01"], ["Lote", "Lote 12"], ["Área física", "300 m²"]], accent: "lot" },
    sale: { label: "CENTRAL DE VENDAS · JORNADA", title: "Nova venda", fields: [["Loteamento", "Vista do Sol"], ["Cliente", "Cliente Exemplo 01"], ["Etapa", "03 · Negociação"]], accent: "sale" },
    finance: { label: "FINANCEIRO · CONTROLE INTERNO", title: "Atenção do operador", fields: [["Antecedência", "4 dias"], ["Ação", "Cobrança manual"], ["Estado", "Acompanhar"]], accent: "finance" },
    partners: { label: "SÓCIOS E PARCEIROS · REGRA", title: "Participação interna", fields: [["Empreendimento", "Vista do Sol"], ["Escopo", "Lotes selecionados"], ["Natureza", "Projeção interna"]], accent: "partners" },
    client: { label: "CLIENTES · FICHA ÚNICA", title: "Cliente Exemplo 01", fields: [["Natureza", "Pessoa física"], ["Telefone", "(00) 00000-0000"], ["Pendências", "Revisar documento"]], accent: "client" },
  }[type];
  return <div className={`operator-manual__screen operator-manual__screen--${content.accent}`} aria-label={`Tela demonstrativa: ${content.title}`}><div className="operator-manual__screen-top"><span className="operator-manual__screen-dot" /><span className="operator-manual__screen-dot" /><span className="operator-manual__screen-dot" /><small>CRM · TELA DEMONSTRATIVA</small></div><div className="operator-manual__screen-body"><div className="operator-manual__screen-sidebar"><b>CRM</b><span>Visão geral</span><span className="is-active">{content.label.split(" · ")[0]}</span><span>Documentos</span><span>Ajuda</span></div><div className="operator-manual__screen-content"><span className="operator-manual__screen-kicker">{content.label}</span><h4>{content.title}</h4><div className="operator-manual__screen-fields">{content.fields.map(([label, value]) => <div key={label}><small>{label}</small><b>{value}</b></div>)}</div><div className="operator-manual__screen-note"><Lightbulb size={14} /> Exemplo fictício para treinamento. Nenhuma ação foi executada.</div></div></div></div>;
}

export default function OperatorManual() {
  const [activeRole, setActiveRole] = useState<RoleKey>("admin");
  const [query, setQuery] = useState("");
  const [activeLesson, setActiveLesson] = useState("context");
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.localStorage.getItem("operator-manual-completed") ?? "[]") as string[]; } catch { return []; }
  });

  useEffect(() => { window.localStorage.setItem("operator-manual-completed", JSON.stringify(completedLessons)); }, [completedLessons]);

  const visibleLessons = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalized) return lessons;
    return lessons.filter((lesson) => `${lesson.title} ${lesson.audience} ${lesson.description} ${lesson.steps.join(" ")}`.toLocaleLowerCase("pt-BR").includes(normalized));
  }, [query]);
  const selectedTrack = tracks.find((track) => track.key === activeRole) ?? tracks[0];
  const selectedLesson = lessons.find((lesson) => lesson.id === activeLesson) ?? lessons[0];
  const completion = Math.round((completedLessons.length / lessons.length) * 100);

  function toggleLesson(id: string) {
    setCompletedLessons((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return <DashboardLayout navigationTitle="Núcleo CRM" accessGate={accessGate}>
    <main className="operator-manual">
      <header className="operator-manual__hero">
        <div className="operator-manual__hero-copy"><p className="operator-manual__eyebrow"><BookOpenCheck size={15} /> MANUAL DO OPERADOR · PRIMEIRO CONTATO</p><h1>Aprender o CRM pode ser leve.</h1><p>Um guia vivo para entender cada setor da Loteadora, praticar com dados fictícios e operar com segurança. Comece pelo seu perfil e avance no seu ritmo.</p><div className="operator-manual__hero-actions"><a href="#trilhas" className="operator-manual__primary"><PlayCircle size={17} /> Começar meu treinamento</a><a href="#duvidas" className="operator-manual__secondary"><CircleHelp size={16} /> Ainda tenho dúvidas</a></div></div><aside className="operator-manual__hero-card"><div className="operator-manual__compass"><GraduationCap size={28} /></div><span>SEU PROGRESSO</span><strong>{completion}%</strong><p>{completedLessons.length} de {lessons.length} aulas concluídas</p><div className="operator-manual__progress"><i style={{ width: `${completion}%` }} /></div><small>O progresso fica salvo neste navegador e não altera dados do CRM.</small></aside></header>

      <section className="operator-manual__welcome" aria-label="Como usar o manual"><div className="operator-manual__section-label"><Sparkles size={15} /> PRIMEIROS 5 MINUTOS</div><div><h2>Você não precisa decorar tudo.</h2><p>Escolha uma trilha, leia a explicação, observe a tela demonstrativa e só depois abra o setor real. As simulações usam nomes, números e situações fictícias.</p></div><div className="operator-manual__rule-grid">{quickRules.map((rule) => { const Icon = rule.icon; return <article key={rule.title}><Icon size={20} /><h3>{rule.title}</h3><p>{rule.text}</p></article>; })}</div></section>

      <section id="trilhas" className="operator-manual__section"><div className="operator-manual__section-heading"><div><p className="operator-manual__eyebrow">ESCOLHA SUA TRILHA</p><h2>O caminho certo para cada função.</h2></div><p>O conteúdo muda conforme sua rotina. Você pode visitar todas as trilhas, mas comece pela que corresponde ao seu trabalho.</p></div><div className="operator-manual__track-grid">{tracks.map((track) => { const Icon = track.icon; return <button key={track.key} type="button" className={`operator-manual__track operator-manual__track--${track.color} ${activeRole === track.key ? "is-active" : ""}`} onClick={() => setActiveRole(track.key)} aria-pressed={activeRole === track.key}><span className="operator-manual__track-icon"><Icon size={19} /></span><span className="operator-manual__track-eyebrow">{track.eyebrow}</span><strong>{track.title}</strong><p>{track.description}</p><small>{track.lessons.length} aulas recomendadas <ArrowRight size={14} /></small></button>; })}</div><article className="operator-manual__selected-track"><div><span className="operator-manual__section-label">TRILHA SELECIONADA · {selectedTrack.eyebrow}</span><h3>{selectedTrack.title}</h3><p>{selectedTrack.description}</p></div><ol>{selectedTrack.lessons.map((lesson, index) => <li key={lesson}><b>0{index + 1}</b>{lesson}</li>)}</ol></article></section>

      <section className="operator-manual__section operator-manual__lesson-section"><div className="operator-manual__section-heading"><div><p className="operator-manual__eyebrow">AULAS PASSO A PASSO</p><h2>Veja, pratique e confira.</h2></div><label className="operator-manual__search"><Search size={16} /><span className="sr-only">Buscar no manual</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por setor, função ou assunto" /></label></div><div className="operator-manual__lesson-layout"><nav className="operator-manual__lesson-list" aria-label="Aulas do manual">{visibleLessons.map((lesson) => <button type="button" key={lesson.id} className={activeLesson === lesson.id ? "is-active" : ""} onClick={() => setActiveLesson(lesson.id)}><span><b>{lesson.number}</b><strong>{lesson.title}</strong><small>{lesson.audience} · {lesson.duration}</small></span>{completedLessons.includes(lesson.id) ? <Check size={17} aria-label="Aula concluída" /> : <ArrowRight size={17} />}</button>)}{visibleLessons.length === 0 && <p className="operator-manual__empty">Nenhuma aula encontrada. Tente “venda”, “financeiro”, “cliente” ou “loteamento”.</p>}</nav><article className="operator-manual__lesson-detail"><div className="operator-manual__lesson-heading"><div><span className="operator-manual__section-label">AULA {selectedLesson.number} · {selectedLesson.audience}</span><h3>{selectedLesson.title}</h3><p>{selectedLesson.description}</p></div><span className="operator-manual__duration">{selectedLesson.duration}</span></div><div className="operator-manual__lesson-columns"><div><h4><ListChecks size={17} /> Faça assim</h4><ol>{selectedLesson.steps.map((step, index) => <li key={step}><b>{index + 1}</b><span>{step}</span></li>)}</ol><div className="operator-manual__tip"><Lightbulb size={17} /><p><b>O que observar:</b> {selectedLesson.observe}</p></div><div className="operator-manual__avoid"><ShieldCheck size={17} /><p><b>Evite este erro:</b> {selectedLesson.avoid}</p></div></div><div><ScreenMockup type={selectedLesson.screen} /><p className="operator-manual__caption"><ClipboardCheck size={14} /> Print guiado com dados fictícios. Use a tela como referência, não como registro real.</p></div></div><div className="operator-manual__lesson-footer"><button type="button" className={completedLessons.includes(selectedLesson.id) ? "is-complete" : ""} onClick={() => toggleLesson(selectedLesson.id)}>{completedLessons.includes(selectedLesson.id) ? <><Check size={16} /> Aula concluída</> : <><ClipboardCheck size={16} /> Marcar como estudada</>}</button>{selectedLesson.link && <Link href={selectedLesson.link}>Abrir setor depois de estudar <ArrowRight size={15} /></Link>}</div></article></div></section>

      <section className="operator-manual__simulation"><div><p className="operator-manual__eyebrow">SIMULAÇÃO SEGURA · SEM BANCO DE DADOS</p><h2>Pratique antes de clicar no CRM real.</h2><p>Use este roteiro com o colega responsável. Diga em voz alta o que você faria, identifique o campo correto e explique qual conferência vem antes da próxima etapa.</p><div className="operator-manual__simulation-steps"><span><b>01</b> Escolher contexto</span><span><b>02</b> Encontrar registro</span><span><b>03</b> Conferir dados</span><span><b>04</b> Pedir revisão</span></div></div><div className="operator-manual__simulation-card"><div><span>CASO FICTÍCIO</span><b>Venda de treinamento · não salvar</b></div><p>Vista do Sol · Quadra 01 · Lote 12<br />Cliente Exemplo 01 · negociação ilustrativa</p><button type="button" onClick={() => setActiveLesson("sale")}>Rever a aula de venda <ArrowRight size={15} /></button></div></section>

      <section id="duvidas" className="operator-manual__faq"><div><p className="operator-manual__eyebrow">PERGUNTAS FREQUENTES</p><h2>Se ficou em dúvida, pare aqui.</h2><p>Uma dúvida bem sinalizada é mais segura do que uma alteração feita no lugar errado.</p></div><div className="operator-manual__faq-list"><details><summary>Posso testar uma venda no ambiente real?<ChevronDown size={17} /></summary><p>Não sem uma autorização específica e um caso de teste preparado. Use a simulação deste manual para treinar os cliques. Uma venda real altera o estoque e organiza informações internas.</p></details><details><summary>O Financeiro gera boletos ou confirma pagamentos?<ChevronDown size={17} /></summary><p>Não. O CRM organiza o controle interno e orienta a cobrança manual. Emissão bancária, mensagem externa, acesso ao banco, baixa e pagamento ficam fora do CRM.</p></details><details><summary>O que faço quando uma informação está pendente?<ChevronDown size={17} /></summary><p>Leia a finalidade da pendência, não invente o dado e não duplique o registro. Encaminhe ao responsável pelo setor ou registre a necessidade no fluxo interno indicado.</p></details><details><summary>Como peço acesso a outro setor?<ChevronDown size={17} /></summary><p>Peça ao administrador responsável para revisar organização, módulo, finalidade, escopo e vigência. O acesso deve ser liberado somente para uma função real e um módulo desenvolvido.</p></details></div></section>

      <footer className="operator-manual__footer"><BookOpenCheck size={22} /><div><b>Manual vivo da Loteadora</b><p>Quando uma função mudar, esta central deve receber uma nova aula, uma tela demonstrativa e a regra de conferência correspondente.</p></div><Link href="/loteadora">Voltar para Loteamentos <ArrowRight size={15} /></Link></footer>
    </main>
  </DashboardLayout>;
}
