import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { activationPathForPasswordFlow } from "./lib/supabaseInvitationActivation";
import SubdivisionFoundation from "./pages/SubdivisionFoundation";
import { lazy, Suspense, useEffect } from "react";

const VendasUrbanas = lazy(() => import("./pages/VendasUrbanas"));
const CrmStrategy = lazy(() => import("./pages/CrmStrategy"));
const PlatformAdmin = lazy(() => import("./pages/PlatformAdmin"));
const OrganizationAdmin = lazy(() => import("./pages/OrganizationAdmin"));
const DomainFoundation = lazy(() => import("./pages/DomainFoundation"));
const AssetFoundation = lazy(() => import("./pages/AssetFoundation"));
const UrbanPipeline = lazy(() => import("./pages/UrbanPipeline"));
const RentalPipeline = lazy(() => import("./pages/RentalPipeline"));
const LotInventory = lazy(() => import("./pages/LotInventory"));
const AccountActivation = lazy(() => import("./pages/AccountActivation"));
const SupabaseLogin = lazy(() => import("./pages/SupabaseLogin"));
const OwnWorkforceAccess = lazy(() => import("./pages/OwnWorkforceAccess"));
const ClientImport = lazy(() => import("./pages/ClientImport"));
const SecurityMfa = lazy(() => import("./pages/SecurityMfa"));

function RouteLoading() {
  return <main className="min-h-screen bg-[#f7f4eb] px-6 py-16 text-[#173b4d]"><p role="status" className="mx-auto max-w-xl font-mono text-xs font-semibold tracking-[.12em]">CARREGANDO ÁREA PROTEGIDA</p></main>;
}

function Router() {
  const invitationActivationPath = typeof window === "undefined" ? null : activationPathForPasswordFlow(window.location.hash);
  useEffect(() => {
    if (invitationActivationPath && window.location.pathname !== "/ativar-conta") {
      window.location.replace(invitationActivationPath);
    }
  }, [invitationActivationPath]);

  if (invitationActivationPath && window.location.pathname !== "/ativar-conta") {
    return null;
  }

  // make sure to consider if you need authentication for certain routes
  return <Suspense fallback={<RouteLoading />}><Switch>
    <Route path={"/entrar"} component={SupabaseLogin} />
    <Route path={"/ativar-conta"} component={AccountActivation} />
    <Route path={"/acesso-equipe"} component={OwnWorkforceAccess} />
    <Route path={"/vendas"} component={VendasUrbanas} />
    <Route path={"/crm"} component={CrmStrategy} />
    <Route path={"/administracao"} component={PlatformAdmin} />
    <Route path={"/adm"} component={OrganizationAdmin} />
    <Route path={"/importar-clientes"} component={ClientImport} />
    <Route path={"/seguranca-mfa"} component={SecurityMfa} />
    <Route path={"/cadastro-base"} component={DomainFoundation} />
    <Route path={"/cadastros"} component={DomainFoundation} />
    <Route path={"/ativos-urbanos"} component={AssetFoundation} />
    <Route path={"/vendas-urbanas"} component={UrbanPipeline} />
    <Route path={"/locacao"} component={RentalPipeline} />
    <Route path={"/loteadora/clientes"} component={SubdivisionFoundation} />
    <Route path={"/loteadora/socios-parceiros"} component={SubdivisionFoundation} />
    <Route path={"/loteadora/vendas"} component={SubdivisionFoundation} />
    <Route path={"/loteadora/financeiro"} component={SubdivisionFoundation} />
    <Route path={"/loteadora"} component={SubdivisionFoundation} />
    <Route path={"/vendas-urbanas/imoveis-proprietarios"} component={UrbanPipeline} />
    <Route path={"/vendas-urbanas/empreendimentos"} component={UrbanPipeline} />
    <Route path={"/vendas-urbanas/empreendimentos-construtoras"} component={UrbanPipeline} />
    <Route path={"/vendas-urbanas/agenda"} component={UrbanPipeline} />
    <Route path={"/vendas-urbanas/perfil-busca"} component={UrbanPipeline} />
    <Route path={"/vendas-urbanas/propostas"} component={UrbanPipeline} />
    <Route path={"/vendas-urbanas/propostas-reservas-contratos"} component={UrbanPipeline} />
    <Route path={"/vendas-urbanas/financeiro"} component={UrbanPipeline} />
    <Route path={"/locacao/imoveis-proprietarios"} component={RentalPipeline} />
    <Route path={"/locacao/perfil-busca"} component={RentalPipeline} />
    <Route path={"/locacao/agenda"} component={RentalPipeline} />
    <Route path={"/locacao/administracao"} component={RentalPipeline} />
    <Route path={"/locacao/contratos"} component={RentalPipeline} />
    <Route path={"/locacao/financeiro"} component={RentalPipeline} />
    <Route path={"/estoque-lotes"} component={LotInventory} />
    <Route path={"/404"} component={NotFound} />
    <Route path={"/"} component={Home} />
    {/* Final fallback route */}
    <Route component={NotFound} />
  </Switch></Suspense>;
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
