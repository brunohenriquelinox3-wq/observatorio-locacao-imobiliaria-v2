import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { groupDashboardNavigation } from "@/lib/dashboardNavigationGroups";
import { getDashboardProfilePresentation } from "@/lib/dashboardProfilePresentation";
import { ArrowUpRight, Compass, LayoutDashboard, LockKeyhole, LogOut, PanelLeft, Users, type LucideIcon } from "lucide-react";
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
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = navigationItems.find(item => item.path === location);
  const navigationGroups = groupDashboardNavigation(navigationItems);
  const isMobile = useIsMobile();
  const profilePresentation = getDashboardProfilePresentation();

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

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
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
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            {navigationGroups.map((group) => (
              <SidebarGroup key={group.id} className="px-2 py-1">
                <SidebarGroupLabel className="h-7 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/55">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu aria-label={`Navegação: ${group.label}`}>
                    {group.items.map(item => {
                      const isActive = location === item.path;
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton
                            isActive={isActive}
                            onClick={() => setLocation(item.path)}
                            tooltip={item.label}
                            className="h-10 transition-all font-normal"
                          >
                            <item.icon
                              className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                            />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
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
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
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
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}
