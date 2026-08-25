/**
 * Caderno de Campo Urbano — módulo Vendas & Lotes.
 * A página trata preço como sinal e dossiê como evidência, com a mesma estética
 * editorial-cartográfica do observatório de locação.
 */
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ArrowDownRight, ArrowUpRight, BadgeCheck, Building2, Check, ChevronRight,
  Compass, FileCheck2, FileKey2, Landmark, MapPinned, Scale, ShieldCheck,
  UserRound, UsersRound,
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const logo = "/manus-storage/logo-bussola-lote_8c3a6907.png";
const terrain = "/manus-storage/territorio-locacao_d7941568.jpg";

const prices = [
  { city: "Fortaleza", rise: 13.49, price: 9350 }, { city: "Salvador", rise: 12.75, price: 8385 },
  { city: "Vitória", rise: 12.53, price: 14818 }, { city: "Belém", rise: 11.36, price: 8882 },
  { city: "São Luís", rise: 9.73, price: 8627 }, { city: "Natal", rise: 9.63, price: 6334 },
];
const chartConfig = { rise: { label: "Variação em 12 meses", color: "#C65A35" } } satisfies ChartConfig;

type Persona = "ownerPF" | "ownerPJ" | "buyerPF" | "buyerPJ";
const forms: Record<Persona, { tag: string; title: string; audience: string; purpose: string; steps: { n: string; title: string; note: string; now: string[]; later: string[] }[] }> = {
  ownerPF: {
    tag: "PROPRIETÁRIO · PESSOA FÍSICA", title: "Quem pode vender? Antes de anunciar, organize as partes e o ativo.", audience: "Pessoa física", purpose: "Separar contato, titularidade declarada, imóvel e autoridade para que a captação não descubra um coproprietário ou pendência apenas na proposta.",
    steps: [
      { n: "01", title: "Contato & ativo", note: "interesse de venda", now: ["Nome de preferência e canal", "Cidade, tipo e faixa de valor", "Imóvel ou lote, prazo e ocupação"], later: ["CPF, identidade, certidões e dados bancários"] },
      { n: "02", title: "Partes declaradas", note: "diagnóstico", now: ["Titular único, copropriedade ou espólio", "Participantes e papel de cada um", "Matrícula e cartório, se disponíveis"], later: ["Documentação integral de todos os envolvidos"] },
      { n: "03", title: "Dossiê do ativo", note: "captação", now: ["Matrícula/certidão a revisar", "IPTU, condomínio e dados municipais", "Autorização de anúncio e condições"], later: ["Envio em link público ou confirmação automática de regularidade"] },
      { n: "04", title: "Proposta & venda", note: "formalização", now: ["Partes, preço, condições e prazo", "Evidências de assinatura e histórico"], later: ["Redigitação de dados já validados"] },
    ],
  },
  ownerPJ: {
    tag: "PROPRIETÁRIO · PESSOA JURÍDICA", title: "CNPJ identifica a empresa. Poderes e vínculo com o ativo exigem evidência.", audience: "Pessoa jurídica", purpose: "Distinguir empresa proprietária, contato comercial, representante para assinatura e ato que sustenta a atuação no processo de venda.",
    steps: [
      { n: "01", title: "Empresa & contato", note: "origem", now: ["CNPJ, razão social e contato", "Relação declarada com o ativo", "Ativo, preço e estágio comercial"], later: ["Atos societários e procurações no primeiro contato"] },
      { n: "02", title: "Estrutura & poderes", note: "diagnóstico", now: ["Situação e QSA como referência", "Assinantes e aprovação interna declarados", "Vínculo da empresa com a matrícula"], later: ["Conclusão automática de que sócio pode vender"] },
      { n: "03", title: "Dossiê societário", note: "captação", now: ["Constituição e alterações a revisar", "Ata, procuração ou deliberação aplicável", "Checklist por tipo de empresa"], later: ["Documentos de terceiros sem função na operação"] },
      { n: "04", title: "Tabela & proposta", note: "governança", now: ["Preço, desconto, canal e alçada", "Versão de condição e assinatura"], later: ["Negociação sem versão ou aprovador"] },
    ],
  },
  buyerPF: {
    tag: "COMPRADOR · PESSOA FÍSICA", title: "Interesse não é dossiê de crédito. Qualifique antes de solicitar prova.", audience: "Pessoa física", purpose: "Começar por busca, prazo, faixa e forma declarada de compra; só abrir identidade, renda e documentos quando houver ativo e finalidade de proposta ou crédito.",
    steps: [
      { n: "01", title: "Busca", note: "60–90 segundos", now: ["Objetivo, tipo e território", "Faixa total e momento de compra", "Contato e preferência de visita"], later: ["CPF, renda comprovada, extratos e FGTS"] },
      { n: "02", title: "Qualificação", note: "3–5 minutos", now: ["Critérios de imóvel ou lote", "Grupo comprador declarado", "Recursos próprios, financiamento ou combinação"], later: ["Holerite, IR ou documentos de co-comprador"] },
      { n: "03", title: "Pré-proposta", note: "ativo definido", now: ["Oferta, sinal, prazo e vigência", "Condições de crédito ou venda de outro ativo", "Participantes e próximos responsáveis"], later: ["Promessa de aprovação ou contrato automático"] },
      { n: "04", title: "Dossiê & contrato", note: "finalidade explícita", now: ["Documentos solicitados na operação", "Evidências de financiamento e assinatura", "Versões e comunicações"], later: ["Arquivo fora do cofre documental"] },
    ],
  },
  buyerPJ: {
    tag: "COMPRADOR · PESSOA JURÍDICA", title: "Quem pesquisa não é necessariamente quem compra ou assina.", audience: "Pessoa jurídica", purpose: "Organizar empresa compradora, objetivo do ativo, decisores, fonte declarada de recursos e governança de proposta antes do dossiê societário.",
    steps: [
      { n: "01", title: "Empresa & busca", note: "interesse", now: ["CNPJ, contato e objetivo do ativo", "Localização, área e prazo", "Fonte declarada de viabilização"], later: ["Atos, balanços e dados de representante"] },
      { n: "02", title: "Governança", note: "qualificação", now: ["Decisor, jurídico e assinante declarados", "Aprovação societária necessária", "SPE, expansão, uso ou desenvolvimento"], later: ["Interpretação automática de poderes"] },
      { n: "03", title: "Pré-proposta", note: "ativo definido", now: ["Ativo, preço, sinal e condições", "Crédito, comitê ou dependência declarada", "Validade e responsáveis"], later: ["Arquivos financeiros sem operação definida"] },
      { n: "04", title: "Dossiê & contrato", note: "formalização", now: ["Atos, representação e deliberação", "Documentos exigidos pela operação", "Assinaturas e trilha"], later: ["Dados sem finalidade contratual"] },
    ],
  },
};

function Eyebrow({ children }: { children: React.ReactNode }) { return <span className="eyebrow">{children}</span>; }
function Source({ href, children }: { href: string; children: React.ReactNode }) { return <a className="source-link" href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight className="h-3 w-3" /></a>; }

export default function VendasUrbanas() {
  const [persona, setPersona] = useState<Persona>("ownerPF");
  const [stepIndex, setStepIndex] = useState(0);
  const model = forms[persona]; const step = model.steps[stepIndex];
  const switchPersona = (value: Persona) => { setPersona(value); setStepIndex(0); };

  return <div className="site-shell sales-shell">
    <div className="paper-noise" />
    <header className="site-header sales-header">
      <a href="/" className="brand"><img src={logo} alt="Símbolo Bússola de Lote"/><span><b>Observatório</b><small>VENDAS & LOTES</small></span></a>
      <nav><a href="/">Locação</a><a href="#mercado">Mercado</a><a href="#formularios">Formulários</a><a href="#produto">Produto</a><a href="/crm">Estratégia CRM</a></nav>
      <a href="#formularios" className="nav-cta">Ver cadastros <ArrowDownRight className="h-4 w-4"/></a>
    </header>

    <main id="topo">
      <section className="sales-hero">
        <div className="sales-hero-copy"><Eyebrow>ESTUDO ESTRATÉGICO · VENDAS URBANAS</Eyebrow><h1>Antes do preço,<em>vem a origem.</em></h1><p>Vender imóvel urbano ou lote com segurança operacional exige conhecer o ativo, quem pode vendê-lo, quem quer comprar e que condição realmente sustenta a proposta.</p><div className="sales-pulses"><div><strong>+5,63%</strong><span>preços de venda<br/>em 12 meses</span></div><div><strong>R$ 9.769</strong><span>média da amostra<br/>por m²</span></div><div><strong>+40,9%</strong><span>vendas de lotes<br/>em MG, 1T/26</span></div></div></div>
        <div className="sales-hero-image"><img src={terrain} alt="Território urbano visto de cima, referência para o estudo de vendas e lotes"/><div className="image-shade"/><div className="sales-map-card"><MapPinned className="h-5 w-5"/><span>REGRA DE CAMPO</span><strong>Um anúncio começa no ativo. Uma venda começa nas partes.</strong><p>Preço, documento e autoridade precisam seguir caminhos distintos, mas conectados.</p></div><span className="coordinate">⌾ ATIVO · PARTE · PROPOSTA</span></div>
      </section>

      <section id="mercado" className="content-section sales-market">
        <div className="section-head"><aside><Eyebrow>01 · LEITURA DE VENDAS</Eyebrow><p>Preço anunciado é uma referência territorial. Não é uma avaliação, nem uma promessa de fechamento.</p></aside><div><h2>O mercado urbano valoriza, mas o dossiê é o que transforma procura em negócio.</h2><p>O índice FipeZAP de venda residencial avançou 5,63% em 12 meses até abril de 2026, em 56 cidades. Lotes urbanizados carregam outra camada de decisão: parcelamento, infraestrutura, registro, fase e regra local.</p></div></div>
        <div className="sales-data-grid"><article className="sales-fact"><span>ÍNDICE DE VENDA</span><strong>0,51%</strong><p>alta mensal do FipeZAP em abril de 2026.</p><Source href="https://www.datazap.com.br/wp-content/uploads/2026/05/fipezap-202604-residencial-venda-compressed.pdf">FipeZAP</Source></article><article className="sales-fact"><span>PREÇO DE REFERÊNCIA</span><strong>R$ 9.769/m²</strong><p>média ponderada da amostra de anúncios residenciais.</p><Source href="https://www.datazap.com.br/wp-content/uploads/2026/05/fipezap-202604-residencial-venda-compressed.pdf">FipeZAP</Source></article><article className="sales-fact clay"><span>LOTE URBANIZADO</span><strong>2.958</strong><p>lotes vendidos no recorte mineiro do 1º trimestre de 2026.</p><Source href="https://sinduscon-mg.org.br/alta-nas-vendas-marca-o-1o-trimestre-de-2026do-mercado-de-loteamentos-em-minas-gerais/">Sinduscon-MG</Source></article></div>
        <article className="sales-chart paper-card"><div className="chart-title"><div><span className="kicker">VARIAÇÃO TERRITORIAL</span><h3>Seis capitais com maior alta anual na amostra de abril de 2026.</h3></div><span>⌾ PREÇO PEDIDO · NÃO PREÇO DE FECHAMENTO</span></div><ChartContainer config={chartConfig} className="chart sales-chart-graph"><BarChart data={prices} layout="vertical" margin={{ top: 2, right: 18, left: 16 }} barSize={18}><CartesianGrid horizontal={false} strokeDasharray="4 4"/><XAxis type="number" tickLine={false} axisLine={false} tickFormatter={value => `${value}%`}/><YAxis type="category" dataKey="city" width={98} tickLine={false} axisLine={false}/><ChartTooltip content={<ChartTooltipContent formatter={value => `${Number(value).toFixed(2).replace(".", ",")}%`}/>} /><Bar dataKey="rise">{prices.map((entry, index) => <Cell key={entry.city} fill={index < 2 ? "#C65A35" : "#DCA989"}/>)}</Bar></BarChart></ChartContainer><p className="source-note">O formulário de captação deve solicitar localização, características e condição do ativo antes de mostrar uma referência. A precificação precisa de contexto local e não deve ser apresentada como garantia. <Source href="https://www.datazap.com.br/wp-content/uploads/2026/05/fipezap-202604-residencial-venda-compressed.pdf">Fonte e método</Source></p></article>
      </section>

      <section id="formularios" className="sales-forms-section"><div className="content-section"><div className="section-head"><aside><Eyebrow>02 · FORMULÁRIOS ROBUSTOS</Eyebrow><p>Quatro jornadas: proprietário e comprador, pessoa física e pessoa jurídica.</p></aside><div><h2>O cadastro não prova uma verdade. Ele organiza a evidência certa para a próxima ação.</h2><p>A jornada começa curta e é expandida apenas quando existe ativo, proposta ou finalidade concreta. Assim, dados pessoais, societários e financeiros não são coletados como pedágio de um primeiro contato.</p></div></div>
        <div className="persona-tabs" role="tablist" aria-label="Tipo de cadastro">{(["ownerPF", "ownerPJ", "buyerPF", "buyerPJ"] as Persona[]).map(value => <button key={value} role="tab" aria-selected={persona === value} onClick={() => switchPersona(value)} className={persona === value ? "active" : ""}>{value.startsWith("owner") ? <Building2 className="h-4 w-4"/> : <UsersRound className="h-4 w-4"/>}{forms[value].tag.replace(" · ", " / ")}</button>)}</div>
        <div className="sales-form-layout"><div className="sales-steps">{model.steps.map((item, index) => <button key={item.n} onClick={() => setStepIndex(index)} aria-pressed={stepIndex === index} className={stepIndex === index ? "active" : ""}><code>{item.n}</code><span><b>{item.title}</b><small>{item.note}</small></span><ChevronRight className="h-4 w-4"/></button>)}</div><article className="sales-detail"><div className="sales-detail-top"><div><span className="kicker">{model.tag} · {step.note.toUpperCase()}</span><h3>{step.title}</h3></div><span><ShieldCheck className="h-4 w-4"/> mínimo necessário</span></div><p>{model.purpose}</p><div className="sales-fields"><div><b>COLETAR NESTA ETAPA</b><ul>{step.now.map(item => <li key={item}><Check className="h-4 w-4"/>{item}</li>)}</ul></div><div className="sales-later"><b>NÃO COLETAR AINDA</b><ul>{step.later.map(item => <li key={item}><FileKey2 className="h-4 w-4"/>{item}</li>)}</ul></div></div><div className="sales-detail-foot"><span>Estado do dado: <strong>declarado</strong> → evidência recebida → em revisão → próxima ação.</span><Source href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm">LGPD</Source></div></article></div>
      </div></section>

      <section className="content-section evidence-section"><div><Eyebrow>03 · DILIGÊNCIA EXPLICÁVEL</Eyebrow><h2>“Regular” não é um botão. É uma trilha de evidências.</h2><p>O produto ganha confiança quando não confunde declaração, documento recebido e revisão. A matrícula é o eixo de diligência do ativo; para lote, o processo também precisa registrar empreendimento, quadra, lote, infraestrutura e situação urbanística declarada.</p><div className="evidence-lane"><div><code>01</code><b>Declarado</b><small>contato informa a relação, condição ou característica</small></div><div><code>02</code><b>Recebido</b><small>documento chega com origem, data e versão</small></div><div><code>03</code><b>Em revisão</b><small>responsável avalia a evidência e registra pendência</small></div><div><code>04</code><b>Próxima ação</b><small>captar, publicar, receber proposta ou encaminhar</small></div></div></div><div className="lot-card"><Landmark className="h-7 w-7"/><span>LOTE NÃO É “CASA SEM OBRA”</span><strong>Quadra, lote, fase, infraestrutura e regra local entram antes da propaganda.</strong><p>A Lei nº 6.766/1979 diferencia loteamento e desmembramento e remete regras complementares a estados e municípios. A ficha precisa carregar o que foi declarado e o que requer verificação.</p><Source href="https://www.planalto.gov.br/ccivil_03/leis/l6766.htm">Lei do Parcelamento do Solo</Source></div></section>

      <section id="produto" className="sales-product"><div className="content-section"><div className="section-head"><aside><Eyebrow>04 · PRODUTO E LANÇAMENTO</Eyebrow><p>A melhor venda inicial é um diagnóstico de qualidade de dossiê, não uma lista de funcionalidades.</p></aside><div><h2>Vender a camada que conecta ativo, parte, proposta e pendência.</h2><p>A ferramenta complementa CRM, portal, jurídico e crédito. Ela cria o mapa operacional que mostra o que está pronto para publicar, o que precisa de mais evidência e o que impede uma proposta de avançar.</p></div></div><div className="product-grid"><article><span>ENTRADA</span><h3>Imobiliárias de venda com captação dispersa.</h3><p>Começar com proprietário PF/PJ, dados do ativo e comprador qualificado — antes de tentar trocar o sistema central.</p></article><article><span>VERTICAL</span><h3>Loteadoras com tabela, canais e alçadas.</h3><p>Conectar lote, condição comercial, comprador e proposta versionada para reduzir ambiguidade de preço e prazo.</p></article><article><span>PILOTO</span><h3>Cinco ativos. Cinco compradores. Sessenta dias.</h3><p>Medir pendência antes da publicação, qualidade de visita, proposta válida e retrabalho documental.</p></article></div></div></section>
      <section className="decision sales-decision"><div><Eyebrow>DECISÃO RECOMENDADA</Eyebrow><h2>Comece por captação com evidência. Depois, escale proposta com governança.</h2></div><a href="#formularios">Explorar cadastros <ArrowDownRight className="h-4 w-4"/></a></section>
    </main>
    <footer><div><div className="brand"><img src={logo} alt=""/><span><b>Observatório</b><small>VENDAS & LOTES</small></span></div><p>Pesquisa estratégica sobre vendas urbanas, lotes, dossiês de proprietários e compradores.</p></div><div><b>FONTES PRINCIPAIS</b><Source href="https://www.datazap.com.br/wp-content/uploads/2026/05/fipezap-202604-residencial-venda-compressed.pdf">FipeZAP · abril/2026</Source><Source href="https://sinduscon-mg.org.br/alta-nas-vendas-marca-o-1o-trimestre-de-2026do-mercado-de-loteamentos-em-minas-gerais/">Sinduscon-MG · lotes</Source><Source href="https://www.gov.br/pt-br/servicos/consultar-cadastro-nacional-de-pessoas-juridicas">Receita Federal · CNPJ</Source></div><p>Preço é referência de anúncio; evidência documental, análise de crédito, contrato e regularidade requerem os responsáveis e fluxos aplicáveis a cada operação.</p></footer>
  </div>;
}
