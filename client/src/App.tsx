import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import VendasUrbanas from "./pages/VendasUrbanas";
import CrmStrategy from "./pages/CrmStrategy";
import PlatformAdmin from "./pages/PlatformAdmin";
import DomainFoundation from "./pages/DomainFoundation";
import AssetFoundation from "./pages/AssetFoundation";
import UrbanPipeline from "./pages/UrbanPipeline";
import RentalPipeline from "./pages/RentalPipeline";
import SubdivisionFoundation from "./pages/SubdivisionFoundation";
import LotInventory from "./pages/LotInventory";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/vendas"} component={VendasUrbanas} />
      <Route path={"/crm"} component={CrmStrategy} />
      <Route path={"/administracao"} component={PlatformAdmin} />
      <Route path={"/cadastro-base"} component={DomainFoundation} />
      <Route path={"/ativos-urbanos"} component={AssetFoundation} />
      <Route path={"/vendas-urbanas"} component={UrbanPipeline} />
      <Route path={"/locacao"} component={RentalPipeline} />
      <Route path={"/loteadora"} component={SubdivisionFoundation} />
      <Route path={"/estoque-lotes"} component={LotInventory} />
      <Route path={"/404"} component={NotFound} />
      <Route path={"/"} component={Home} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
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
