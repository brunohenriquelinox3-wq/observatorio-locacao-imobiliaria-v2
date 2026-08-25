/**
 * Caderno de Campo Urbano: investigação territorial em papel mineral,
 * azul cadastral e argila de decisão. Cada interação revela contexto útil.
 */
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Compass,
  FileKey2,
  Landmark,
  MapPinned,
  ShieldCheck,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const logo = "/manus-storage/logo-bussola-lote_8c3a6907.png";
const hero = "/manus-storage/hero-observatorio-locacao_7da3ef2a.jpg";
const journey = "/manus-storage/jornada-demanda_78f475a0.jpg";

const trend = [
  { periodo: "2022", valor: 16.55 }, { periodo: "2023", valor: 16.16 },
  { periodo: "2024", valor: 13.5 }, { periodo: "2025", valor: 9.44 }, { periodo: "Jul/26*", valor: 9.28 },
];
const rentals = [{ ano: "2016", valor: 12.2 }, { ano: "2025", valor: 18.9 }];
const cities = [
  { cidade: "Aracaju", alta: 25.78, preco: 36.9, yield: 6.67 },
  { cidade: "Teresina", alta: 19.16, preco: 32.45, yield: 6.32 },
  { cidade: "Fortaleza", alta: 16.27, preco: 41.66, yield: 4.94 },
  { cidade: "Brasília", alta: 14.8, preco: 54.56, yield: 6.45 },
  { cidade: "Natal", alta: 14.6, preco: 44.26, yield: 7.85 },
  { cidade: "Rio de Janeiro", alta: 13.52, preco: 60.8, yield: 6.29 },
];
const configs = {
  trend: { valor: { label: "Variação em 12 meses", color: "#C65A35" } },
  rentals: { valor: { label: "Domicílios alugados", color: "#173B4D" } },
  cities: { alta: { label: "Variação em 12 meses", color: "#C65A35" } },
} satisfies Record<string, ChartConfig>;

const steps = [
  { n: "01", title: "Interesse", time: "60–90 segundos", icon: Target, purpose: "Captar demanda e viabilizar uma primeira resposta útil.", fields: ["Cidade e até três bairros", "Data de mudança", "Orçamento mensal total", "Tipo, quartos e contato"], avoid: "CPF, RG, comprovantes, renda detalhada e dados de fiador." },
  { n: "02", title: "Qualificação", time: "3–5 minutos", icon: SlidersHorizontal, purpose: "Converter interesse em uma ficha de busca acionável.", fields: ["Critérios e preferências", "Composição, pet e necessidades funcionais", "Faixa e vínculo de renda", "Visita e alternativa de garantia"], avoid: "Arquivos financeiros, documentos de terceiros e perguntas sem efeito no match." },
  { n: "03", title: "Dossiê", time: "Proposta vinculada", icon: FileKey2, purpose: "Iniciar análise para um imóvel específico, em ambiente autenticado.", fields: ["Identificação e endereço atual", "Renda e evidência compatível", "Participantes e garantia escolhida", "Proposta e autorizações"], avoid: "Documento sem finalidade clara, garantia duplicada ou envio em canal aberto." },
  { n: "04", title: "Contrato", time: "Formalização", icon: ClipboardCheck, purpose: "Transformar dossiê aprovado em operação contratual rastreável.", fields: ["Condições revisadas", "Vistoria vinculada", "Assinaturas e comunicação", "Retenção e permissões"], avoid: "Redigitação e acesso indiscriminado a arquivos." },
];
const audiences = {
  imobiliarias: { tag: "MERCADO DE ENTRADA", title: "Imobiliárias primeiro. Loteadoras depois, com evidência territorial.", text: "A imobiliária de locação sente diariamente a dor de procurar contexto entre anúncio, mensagem e planilha. É onde a hipótese de valor pode ser medida com rapidez.", items: ["tempo até primeiro contato", "visita por perfil qualificado", "dossiê completo na 1ª solicitação"] },
  loteadoras: { tag: "VERTICAL ADJACENTE", title: "Para loteadoras, a proposta é inteligência de demanda — não um ERP de locação.", text: "Após provar o ganho em carteira e atendimento, a plataforma pode revelar demanda territorial de bairros em maturação, ativos de locação e parceiros locais.", items: ["interesse por região", "lacuna de tipologia e custo", "sinal de demanda antes da carteira"] },
};
const roadmap = [["Descoberta", "2 sem.", "Mapear fluxo, perdas e sistemas de 5–8 imobiliárias."], ["Protótipo", "2 sem.", "Testar linguagem e painel com equipes reais."], ["MVP", "6–8 sem.", "Captura, fila, match básico e permissões."], ["Piloto", "60 dias", "Medir adoção, ganho operacional e pagamento."]];

function Eyebrow({ children }: { children: React.ReactNode }) { return <span className="eyebrow">{children}</span>; }
function Source({ href, children }: { href: string; children: React.ReactNode }) { return <a className="source-link" href={href} target="_blank" rel="noreferrer">{children} <ArrowUpRight className="h-3 w-3" /></a>; }

export default function Home() {
  const [stepIndex, setStepIndex] = useState(0);
  const [cityName, setCityName] = useState("Aracaju");
  const [audience, setAudience] = useState<"imobiliarias" | "loteadoras">("imobiliarias");
  const selected = cities.find(item => item.cidade === cityName) || cities[0];
  const form = steps[stepIndex]; const FormIcon = form.icon; const segment = audiences[audience];

  return <div className="site-shell">
    <div className="paper-noise" />
    <header className="site-header">
      <a href="#topo" className="brand"><img src={logo} alt="Símbolo Bússola de Lote" /><span><b>Observatório</b><small>LOCAÇÃO</small></span></a>
      <nav><a href="#mercado">Mercado</a><a href="#cadastro">Cadastro</a><a href="#lancamento">Lançamento</a><a href="/vendas">Vendas & lotes</a></nav>
      <a href="#cadastro" className="nav-cta">Ver modelo <ArrowDownRight className="h-4 w-4" /></a>
    </header>

    <main id="topo">
      <section className="hero-section">
        <div className="hero-copy">
          <Eyebrow>ESTUDO ESTRATÉGICO · AGOSTO 2026</Eyebrow>
          <h1>A procura já cresceu.<em>A operação precisa enxergar.</em></h1>
          <p>Uma leitura do aluguel residencial brasileiro e uma estratégia para transformar contatos soltos em demanda priorizada, carteira mais aderente e dossiês seguros.</p>
          <div className="hero-stats"><div><strong>18,9 mi</strong><span>domicílios alugados<br />em 2025</span></div><div><strong>+9,28%</strong><span>aluguel em 12 meses<br />até jul/2026</span></div><div><strong>4</strong><span>camadas de<br />cadastro</span></div></div>
        </div>
        <div className="hero-image"><img src={hero} alt="Vista aérea editorial de um bairro residencial brasileiro com camadas cartográficas" /><div className="image-shade" /><div className="hero-note"><Compass className="h-4 w-4" /><b>SINAL DE MERCADO</b><strong>Quase um em cada quatro domicílios brasileiros é alugado.</strong><p>A expansão pede ferramentas que capturem intenção antes que ela se perca.</p></div><span className="coordinate">23° 33′ S · 46° 38′ W</span></div>
      </section>

      <section id="mercado" className="content-section">
        <div className="section-head"><aside><Eyebrow>01 · LEITURA DE MERCADO</Eyebrow><p>Um mercado nacional, mas com sinais locais muito diferentes.</p></aside><div><h2>O aluguel se expandiu em volume e valor. O produto precisa responder por território.</h2><p>O parque alugado cresceu, mas preço pedido, yield e velocidade de alta variam por cidade e tipologia. Por isso, procura deve ser organizada por localização, custo total e momento de mudança.</p></div></div>
        <div className="market-grid">
          <article className="paper-card chart-card wide"><span className="kicker">RITMO DE PREÇOS</span><h3>O aluguel desacelerou, mas segue acima da inflação.</h3><div className="metric-chip">+9,28% em 12 meses</div><ChartContainer config={configs.trend} className="chart"><AreaChart data={trend} margin={{ top: 16, right: 6, left: -20 }}><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#C65A35" stopOpacity=".35"/><stop offset="1" stopColor="#C65A35" stopOpacity=".02"/></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="4 4"/><XAxis dataKey="periodo" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false} tickFormatter={v => `${v}%`}/><ChartTooltip content={<ChartTooltipContent formatter={v => `${Number(v).toFixed(2).replace(".", ",")}%`}/>} /><Area dataKey="valor" type="monotone" stroke="#C65A35" strokeWidth={3} fill="url(#area)"/></AreaChart></ChartContainer><p className="source-note">Variação acumulada em 12 meses. *Jul/26 encerra em julho. <Source href="https://imoveis.grupoolx.com.br/uploads/fipezap_202607_residencial_locacao_25996d7baf.pdf">FipeZAP</Source></p></article>
          <article className="paper-card chart-card"><span className="kicker">BASE DO MERCADO</span><h3>O estoque de domicílios alugados cresceu 54,1% desde 2016.</h3><ChartContainer config={configs.rentals} className="chart short"><BarChart data={rentals} margin={{ top: 18, right: 2, left: -22 }} barSize={60}><CartesianGrid vertical={false} strokeDasharray="4 4"/><XAxis dataKey="ano" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false} tickFormatter={v => `${v} mi`}/><ChartTooltip content={<ChartTooltipContent formatter={v => `${Number(v).toFixed(1).replace(".", ",")} milhões`}/>} /><Bar dataKey="valor" fill="#173B4D"/></BarChart></ChartContainer><p className="source-note">Domicílios particulares permanentes alugados. <Source href="https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/46449-domicilios-alugados-cresceram-mais-de-50-desde-2016">IBGE / PNAD</Source></p></article>
          <article className="paper-card chart-card wide"><div className="card-head"><div><span className="kicker">RADAR TERRITORIAL</span><h3>A alta não é uniforme: recortes locais mudam a prioridade comercial.</h3></div><label>CIDADE <select value={cityName} onChange={e => setCityName(e.target.value)}>{cities.map(city => <option key={city.cidade}>{city.cidade}</option>)}</select></label></div><ChartContainer config={configs.cities} className="chart"><BarChart data={cities} layout="vertical" margin={{ top: 0, right: 8, left: 10 }} barSize={16}><CartesianGrid horizontal={false} strokeDasharray="4 4"/><XAxis type="number" tickLine={false} axisLine={false} tickFormatter={v => `${v}%`}/><YAxis type="category" dataKey="cidade" width={102} tickLine={false} axisLine={false}/><ChartTooltip content={<ChartTooltipContent formatter={v => `${Number(v).toFixed(2).replace(".", ",")}%`}/>} /><Bar dataKey="alta">{cities.map(city => <Cell key={city.cidade} fill={city.cidade === cityName ? "#C65A35" : "#DCA989"}/>)}</Bar></BarChart></ChartContainer><p className="source-note">Capitais com maior variação em 12 meses até julho de 2026. Fonte: FipeZAP.</p></article>
          <article className="city-read"><MapPinned className="h-6 w-6"/><span>LEITURA DE {selected.cidade.toUpperCase()}</span><strong>+{selected.alta.toFixed(2).replace(".", ",")}%</strong><p>variação do preço pedido em 12 meses</p><div><b>R$ {selected.preco.toFixed(2).replace(".", ",")}</b><small>por m²</small><b>{selected.yield.toFixed(2).replace(".", ",")}%</b><small>yield a.a.</small></div></article>
        </div>
      </section>

      <section id="cadastro" className="cadastro-section"><div className="content-section"><div className="section-head"><aside><Eyebrow>02 · CADASTRO ROBUSTO</Eyebrow><p>O melhor cadastro não é o mais longo. É o que pede a evidência certa na etapa certa.</p></aside><div><h2>Quatro camadas. Uma decisão por vez.</h2><p>O formulário público inicia a conversa em menos de 90 segundos. Documentação só é pedida quando existe imóvel, proposta e finalidade definida.</p></div></div><div className="form-board"><div className="step-list">{steps.map((item, index) => { const Icon = item.icon; return <button key={item.n} aria-pressed={stepIndex === index} onClick={() => setStepIndex(index)} className={stepIndex === index ? "active" : ""}><code>{item.n}</code><Icon className="h-5 w-5"/><span><b>{item.title}</b><small>{item.time}</small></span><ChevronRight className="h-4 w-4"/></button>; })}</div><article className="form-detail"><div className="detail-top"><div><span className="kicker">CAMADA {form.n} · {form.time}</span><h3><FormIcon className="h-8 w-8" />{form.title}</h3></div><span className="privacy"><ShieldCheck className="h-4 w-4"/> finalidade visível</span></div><p className="purpose">{form.purpose}</p><div className="collect-grid"><div><span>COLETAR AGORA</span><ul>{form.fields.map(field => <li key={field}><Check className="h-4 w-4"/>{field}</li>)}</ul></div><div className="avoid"><span><CircleAlert className="h-4 w-4"/> NÃO COLETAR AINDA</span><p>{form.avoid}</p></div></div><div className="detail-foot">LGPD: finalidade, adequação, necessidade e transparência. <Source href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm">Consultar lei</Source></div></article></div></div></section>

      <section className="content-section action-section"><div><Eyebrow>DO CADASTRO À DECISÃO</Eyebrow><h2>Cadastro não é burocracia quando gera a próxima melhor ação.</h2><p>A fila deve ser explicável: intenção, aderência à carteira, completude e relacionamento. Ela orienta o corretor, mas não cria uma decisão opaca de aprovação ou recusa.</p><div className="action-grid">{[["Intenção", "data de mudança e disponibilidade"], ["Aderência", "região, custo total e imóvel"], ["Completude", "dados suficientes para seguir"], ["Relação", "resposta, visita e atualização"]].map(([title, text], i) => <div key={title}><code>0{i + 1}</code><b>{title}</b><small>{text}</small></div>)}</div></div><div className="journey-image"><img src={journey} alt="Mesa de pesquisa com mapa, chaves e modelo de edifício"/><div><Compass className="h-6 w-6"/><strong>Cada campo deve responder: “o que a operação fará melhor com esta informação?”</strong><p>A resposta define o que entra no formulário público e o que aguarda o dossiê seguro.</p></div></div></section>

      <section id="lancamento" className="launch-section"><div className="content-section"><div className="section-head"><aside><Eyebrow>03 · ESTRATÉGIA DE LANÇAMENTO</Eyebrow><p>Começar por quem sofre a dor diariamente reduz complexidade e aumenta aprendizado.</p></aside><div><h2>Vender uma camada de inteligência — não mais um sistema inteiro.</h2><p>O produto complementa ERP, portal e trabalho local: organiza a demanda, orienta o atendimento e expõe a lacuna entre procura e carteira.</p></div></div><div className="audience-tabs"><button className={audience === "imobiliarias" ? "active" : ""} onClick={() => setAudience("imobiliarias")}>Imobiliárias primeiro</button><button className={audience === "loteadoras" ? "active" : ""} onClick={() => setAudience("loteadoras")}>Loteadoras depois</button></div><div className="launch-grid"><article className="segment-card"><span>{segment.tag}</span><h3>{segment.title}</h3><p>{segment.text}</p><small>MEDIR NO PILOTO</small><ul>{segment.items.map(item => <li key={item}><BadgeCheck className="h-4 w-4"/>{item}</li>)}</ul></article><article className="roadmap"><span><Landmark className="h-5 w-5"/>ROTEIRO DE DESENVOLVIMENTO</span><div>{roadmap.map(([title, time, text]) => <article key={title}><code>{time}</code><h3>{title}</h3><p>{text}</p></article>)}</div></article></div></div></section>
      <section className="decision"><div><Eyebrow>DECISÃO RECOMENDADA</Eyebrow><h2>Lançar primeiro o cadastro progressivo como ativo operacional da imobiliária.</h2></div><a href="#mercado">Revisar evidências <ArrowUpRight className="h-4 w-4"/></a></section>
    </main>
    <footer><div><div className="brand"><img src={logo} alt=""/><span><b>Observatório</b><small>LOCAÇÃO</small></span></div><p>Pesquisa estratégica sobre locação, cadastro de clientes e lançamento para imobiliárias e loteadoras.</p></div><div><b>FONTES PRINCIPAIS</b><Source href="https://imoveis.grupoolx.com.br/uploads/fipezap_202607_residencial_locacao_25996d7baf.pdf">FipeZAP · julho/2026</Source><Source href="https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/46449-domicilios-alugados-cresceram-mais-de-50-desde-2016">IBGE · PNAD Contínua</Source><Source href="https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte">ANPD · segurança</Source></div><p>Os números de preço refletem anúncios de novos aluguéis na amostra FipeZAP. O modelo de cadastro é uma recomendação estratégica e deve passar por revisão jurídica e de segurança em cada operação.</p></footer>
  </div>;
}
