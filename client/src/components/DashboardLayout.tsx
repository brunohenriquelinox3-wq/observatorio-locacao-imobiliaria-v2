import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { filterNavigationByAuthorizedModules } from "@/lib/dashboardAuthorizedNavigation";
import { shouldCloseMobileNavigationAfterRouteChange } from "@/lib/dashboardNavigationBehavior";
import { dashboardMainContentId, dashboardSkipLinkLabel } from "@/lib/dashboardAccessibility";
import { groupDashboardNavigation } from "@/lib/dashboardNavigationGroups";
import { isNavigationPaletteShortcut } from "@/lib/dashboardNavigationPalette";
import { getDashboardProfilePresentation } from "@/lib/dashboardProfilePresentation";
import { getSidebarWidthAfterKeyboardCommand } from "@/lib/dashboardSidebarResize";
import { crmNavigationItems } from "@/lib/crmNavigation";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, Building2, Compass, Landmark, LayoutDashboard, Layers3, LockKeyhole, LogOut, MapPinned, PanelLeft, Search, Users, type LucideIcon } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import "../admin-access.css";

const defaultMenuItems = [
  { icon: LayoutDashboard, label: "Page 1", path: "/" },
  { icon: Users, label: "Page 2", path: "/some-path" },
];

export type DashboardNavigationItem = {
  icon: LucideIcon;
  label: string;
  path: string;
  disabled?: boolean;
  description?: string;
};

export type DashboardAccessGate = {
  eyebrow: string;
  title: string;
  description: string;
  routeTitle: string;
  routeDetail: string;
  actionLabel: string;
  footerLabel: string;
  footerValue: string;
  footerNote: string;
  railTop: string;
  railBottom: string;
};

const defaultAccessGate: DashboardAccessGate = {
  eyebrow: "CAMADA RESTRITA · EVIDÊNCIA ANTES DE PRIVILÉGIO",
  title: "Entre na central que governa a plataforma — não os dados de cada cliente.",
  description: "Este acesso protege organizações, permissões, sessões e trilhas de auditoria. A identidade é só o primeiro passo: alçada, escopo e MFA continuam sendo verificados antes de qualquer comando sensível.",
  routeTitle: "Rota de acesso",
  routeDetail: "Autenticação → MFA → escopo vigente → policy",
  actionLabel: "Acessar área governada",
  footerLabel: "CAMPO DE LEITURA",
  footerValue: "23° 33′ S · 46° 38′ W",
  footerNote: "Nenhum e-mail ou login recebe privilégio por si só.",
  railTop: "ADMIN",
  railBottom: "PLATAFORMA",
};

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

const columnSidebarIcons = {
  loteadora: Landmark,
  urban_sales: Building2,
  rental: MapPinned,
} as const;

function isColumnSidebarGroup(groupId: string): groupId is keyof typeof columnSidebarIcons {
  return groupId in columnSidebarIcons;
}

export default function DashboardLayout({
  children,
  navigationItems = defaultMenuItems,
  navigationTitle = "Navegação",
  accessGate = defaultAccessGate,
}: {
  children: React.ReactNode;
  navigationItems?: DashboardNavigationItem[];
  navigationTitle?: string;
  accessGate?: DashboardAccessGate;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="admin-access-gate">
        <div className="admin-access-gate__grid" aria-hidden="true" />
        <header className="admin-access-gate__masthead">
          <div className="admin-access-gate__brand">
            <div className="admin-access-gate__compass"><Compass size={22} /></div>
            <span><b>Observatório</b><small>LOCAÇÃO · CRM</small></span>
          </div>
          <p>⌖ CRM.01 · ACESSO GOVERNADO</p>
        </header>
        <main className="admin-access-gate__sheet">
          <aside className="admin-access-gate__rail" aria-hidden="true">
            <span>{accessGate.railTop}</span><i /><span>{accessGate.railBottom}</span>
          </aside>
          <section className="admin-access-gate__content">
            <p className="admin-access-gate__eyebrow">{accessGate.eyebrow}</p>
            <h1>{accessGate.title}</h1>
            <p>{accessGate.description}</p>
            <div className="admin-access-gate__method">
              <LockKeyhole size={18} />
              <span><b>{accessGate.routeTitle}</b><small>{accessGate.routeDetail}</small></span>
            </div>
            <Button onClick={() => startLogin()} size="lg" className="admin-access-gate__cta">
              {accessGate.actionLabel} <ArrowUpRight size={17} />
            </Button>
          </section>
          <footer className="admin-access-gate__note">
            <span>{accessGate.footerLabel}</span>
            <b>{accessGate.footerValue}</b>
            <p>{accessGate.footerNote}</p>
          </footer>
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent
        setSidebarWidth={setSidebarWidth}
        navigationItems={navigationItems}
        navigationTitle={navigationTitle}
      >
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
  navigationItems: DashboardNavigationItem[];
  navigationTitle: string;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
  navigationItems,
  navigationTitle,
}: DashboardLayoutContentProps) {
  const { logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const [isNavigationPaletteOpen, setIsNavigationPaletteOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const profilePresentation = getDashboardProfilePresentation();
  const moduleQueryOptions = { retry: false, refetchOnWindowFocus: false };
  const loteadoraContextsQuery = trpc.organizationContext.listAuthorizedForModule.useQuery(
    { module: "loteadora" },
    moduleQueryOptions,
  );
  const urbanSalesContextsQuery = trpc.organizationContext.listAuthorizedForModule.useQuery(
    { module: "vendas_urbanas" },
    moduleQueryOptions,
  );
  const rentalContextsQuery = trpc.organizationContext.listAuthorizedForModule.useQuery(
    { module: "locacao" },
    moduleQueryOptions,
  );
  const canonicalNavigationItems = [...crmNavigationItems, ...navigationItems].filter(
    (item, index, allItems) => allItems.findIndex(candidate => candidate.path === item.path) === index,
  );
  const visibleNavigationItems = filterNavigationByAuthorizedModules({
    items: canonicalNavigationItems,
    isAvailabilityResolved:
      loteadoraContextsQuery.isSuccess && urbanSalesContextsQuery.isSuccess && rentalContextsQuery.isSuccess,
    authorizedModules: {
      loteadora: Boolean(loteadoraContextsQuery.data?.length),
      vendas_urbanas: Boolean(urbanSalesContextsQuery.data?.length),
      locacao: Boolean(rentalContextsQuery.data?.length),
    },
  });
  const activeMenuItem = visibleNavigationItems.find(item => item.path === location);
  const navigationGroups = groupDashboardNavigation(visibleNavigationItems);

  const navigateTo = (path: string) => {
    setLocation(path);
    if (shouldCloseMobileNavigationAfterRouteChange(isMobile)) {
      setOpenMobile(false);
    }
  };

  const navigateFromPalette = (path: string) => {
    setIsNavigationPaletteOpen(false);
    navigateTo(path);
  };

  const handleResizeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isCollapsed) return;

    const nextWidth = getSidebarWidthAfterKeyboardCommand({
      currentWidth: sidebarRef.current?.getBoundingClientRect().width ?? DEFAULT_WIDTH,
      key: event.key,
      minWidth: MIN_WIDTH,
      maxWidth: MAX_WIDTH,
    });

    if (nextWidth === null) return;

    event.preventDefault();
    setSidebarWidth(nextWidth);
  };

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isNavigationPaletteShortcut(event)) return;
      event.preventDefault();
      setIsNavigationPaletteOpen(open => !open);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <a href={`#${dashboardMainContentId}`} className="sr-only fixed left-4 top-4 z-[100] rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg focus:not-sr-only focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        {dashboardSkipLinkLabel}
      </a>
      <CommandDialog
        open={isNavigationPaletteOpen}
        onOpenChange={setIsNavigationPaletteOpen}
        title="Ir para"
        description="Navegue somente entre as áreas disponíveis nesta sessão."
      >
        <CommandInput placeholder="Buscar uma área disponível..." />
        <CommandList>
          <CommandEmpty>Nenhuma área disponível encontrada.</CommandEmpty>
          {navigationGroups.map((group, groupIndex) => (
            <div key={group.id}>
              {groupIndex > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading={group.label}>
                {group.items.map(item => (
                    <CommandItem
                      key={item.path}
                      value={`${group.label} ${item.label}`}
                      disabled={item.disabled}
                      onSelect={() => !item.disabled && navigateFromPalette(item.path)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
      <div className="relative" ref={sidebarRef}>
          <Sidebar
          collapsible="icon"
          className="border-r border-[#164757] [--sidebar:#092733] [--sidebar-foreground:#ecf7f6] [--sidebar-primary:#57d8bd] [--sidebar-primary-foreground:#072530] [--sidebar-accent:#143d4a] [--sidebar-accent-foreground:#f6fffe] [--sidebar-border:#1d4b59] [--sidebar-ring:#66e1c6]"
          style={{
            "--sidebar": "#092733",
            "--sidebar-foreground": "#ecf7f6",
            "--sidebar-primary": "#57d8bd",
            "--sidebar-primary-foreground": "#072530",
            "--sidebar-accent": "#143d4a",
            "--sidebar-accent-foreground": "#f6fffe",
            "--sidebar-border": "#1d4b59",
            "--sidebar-ring": "#66e1c6",
          } as CSSProperties}
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex w-full items-center gap-3 px-2 transition-all">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Alternar navegação"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold tracking-tight truncate">
                    {navigationTitle}
                  </span>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => setIsNavigationPaletteOpen(true)}
                className="ml-auto flex h-8 items-center gap-1.5 rounded-md px-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Abrir paleta de navegação"
                title="Abrir paleta de navegação (Control ou Command + K)"
              >
                <Search className="h-4 w-4" />
                {!isCollapsed ? <span className="text-[10px] font-semibold tracking-wide">⌘K</span> : null}
              </button>
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            {navigationGroups.map((group) => {
              const isColumnGroup = isColumnSidebarGroup(group.id);
              const firstAvailableItem = group.items.find(item => !item.disabled);
              const isGroupDisabled = !firstAvailableItem;
              const isGroupActive = group.items.some(item => item.path === location);
              const ColumnIcon = isColumnSidebarGroup(group.id) ? columnSidebarIcons[group.id] : Layers3;

              return (
                <SidebarGroup key={group.id} className="px-2 py-1">
                  <SidebarGroupLabel className="h-7 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/55">
                    {isColumnGroup ? "Coluna" : group.label}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    {isColumnGroup ? (
                      <SidebarMenu aria-label={`Coluna ${group.label}`}>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            isActive={isGroupActive}
                            disabled={isGroupDisabled}
                            aria-current={isGroupActive ? "page" : undefined}
                            onClick={() => firstAvailableItem && navigateTo(firstAvailableItem.path)}
                            tooltip={isGroupDisabled ? `${group.label}: nenhum contexto autorizado nesta sessão` : `Abrir coluna ${group.label}`}
                            className="h-10 font-semibold"
                          >
                            <ColumnIcon className={`h-4 w-4 ${isGroupActive ? "text-primary" : ""}`} />
                            <span>{group.label}</span>
                          </SidebarMenuButton>
                          <SidebarMenuSub aria-label={`Setores de ${group.label}`}>
                            {group.items.map((item, itemIndex) => {
                              const isActive = location === item.path;
                              return (
                                <SidebarMenuSubItem key={item.path}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isActive}
                                    size="sm"
                                    className={item.disabled ? "cursor-not-allowed opacity-50" : ""}
                                  >
                                    <button
                                      type="button"
                                      disabled={item.disabled}
                                      aria-current={isActive ? "page" : undefined}
                                      aria-label={`${String(itemIndex + 1).padStart(2, "0")} · ${item.label}${item.disabled ? " · bloqueado" : ""}`}
                                      title={item.description ?? item.label}
                                      onClick={() => !item.disabled && navigateTo(item.path)}
                                    >
                                      <span className="w-4 shrink-0 text-[9px] font-semibold text-sidebar-foreground/45">{String(itemIndex + 1).padStart(2, "0")}</span>
                                      <span>{item.label}</span>
                                    </button>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    ) : (
                      <SidebarMenu aria-label={`Navegação: ${group.label}`}>
                        {group.items.map(item => {
                          const isActive = location === item.path;
                          return (
                            <SidebarMenuItem key={item.path}>
                              <SidebarMenuButton
                                isActive={isActive}
                                disabled={item.disabled}
                                aria-current={isActive ? "page" : undefined}
                                onClick={() => !item.disabled && navigateTo(item.path)}
                                tooltip={item.description ?? item.label}
                                className="h-10 transition-all font-normal"
                              >
                                <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                                <span>{item.label}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    )}
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            })}
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label={profilePresentation.actionLabel} className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {profilePresentation.avatarLabel}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {profilePresentation.sessionLabel}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {profilePresentation.privacyLabel}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Encerrar sessão</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 h-full w-1 cursor-col-resize transition-colors hover:bg-primary/20 focus:w-2 focus:bg-primary/30 focus:outline-none ${isCollapsed || isMobile ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          onKeyDown={handleResizeKeyDown}
          role="separator"
          aria-label="Ajustar largura da navegação"
          aria-orientation="vertical"
          aria-valuemin={MIN_WIDTH}
          aria-valuemax={MAX_WIDTH}
          aria-valuenow={Math.round(sidebarRef.current?.getBoundingClientRect().width ?? DEFAULT_WIDTH)}
          aria-valuetext={`${Math.round(sidebarRef.current?.getBoundingClientRect().width ?? DEFAULT_WIDTH)} pixels`}
          tabIndex={isCollapsed || isMobile ? -1 : 0}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main id={dashboardMainContentId} tabIndex={-1} className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}
