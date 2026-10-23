'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Package,
  Tags,
  History,
  Users,
  Menu,
  LogOut,
  Activity,
  Database,
  Wifi,
  Sparkles,
} from 'lucide-react';

const navigation = [
  { name: 'แดชบอร์ด', href: '/dashboard', icon: LayoutDashboard },
  { name: 'สินค้า', href: '/products', icon: Package },
  { name: 'หมวดหมู่', href: '/categories', icon: Tags },
  { name: 'ประวัติสต๊อก', href: '/stock-history', icon: History },
];

const adminNavigation = [
  { name: 'จัดการผู้ใช้', href: '/users', icon: Users },
];

function SidebarContent({ pathname, isAdmin }: { pathname: string; isAdmin: boolean }) {
  return (
    <div className="flex flex-col h-full bg-[#0a101f] text-slate-200">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-blue-900/30">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-500 text-white shadow-[0_0_20px_rgba(0,212,255,0.45)] group-hover:shadow-[0_0_25px_rgba(0,212,255,0.7)] transition-all">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">StockPro</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">OPS</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Inventory Ops v1.0</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>MENU</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-950/70 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,212,255,0.15)]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-600 group-hover:bg-slate-400 transition-colors" />
                    )}
                    <item.icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                      LIVE
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {isAdmin && (
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              ADMIN CONTROL
            </p>
            <nav className="space-y-1">
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-950/70 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,212,255,0.15)]'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isActive ? (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-600 group-hover:bg-slate-400" />
                      )}
                      <item.icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* SYSTEM STATUS Widget (Sci-Fi Bottom Panel from Reference) */}
      <div className="p-3 border-t border-blue-900/30">
        <div className="rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 p-3.5 space-y-2.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">SYSTEM STATUS</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5"><Wifi className="w-3 h-3 text-cyan-400" /> Network</span>
              <span className="text-cyan-400 font-mono text-[10px]">99.9%</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full w-[95%] shadow-[0_0_8px_#00e5ff]" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5"><Database className="w-3 h-3 text-purple-400" /> DB Sync</span>
              <span className="text-purple-400 font-mono text-[10px]">Postgres OK</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-400 h-1.5 rounded-full w-[100%] shadow-[0_0_8px_#a855f7]" />
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Node: Local</span>
            <span>Port: 4000</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070b16]">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-cyan-500 border-t-transparent shadow-[0_0_15px_#00e5ff]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#070b16] text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-blue-900/30 bg-[#0a101f] shrink-0">
        <SidebarContent pathname={pathname} isAdmin={isAdmin} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-[#0a101f] border-r border-blue-900/30">
          <SidebarContent pathname={pathname} isAdmin={isAdmin} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-blue-900/30 bg-[#0a101f]/80 backdrop-blur-xl shrink-0">
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger className="inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-white/5 text-slate-200 lg:hidden cursor-pointer border border-blue-900/30">
                  <Menu className="h-5 w-5" />
                </SheetTrigger>
              </Sheet>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#00e5ff]" />
                <span>Live Ops Connected</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer outline-none">
                  <Avatar className="h-7 w-7 border border-cyan-500/40">
                    <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-cyan-500 text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xs font-semibold leading-none text-slate-100">{user.name}</span>
                    <span className="text-[10px] text-cyan-400 font-mono mt-0.5">{user.role}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-[#0d1527] border border-blue-900/50 text-slate-200 shadow-2xl">
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/40 focus:bg-red-950/40 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 relative">
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-10 right-1/4 w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
          <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
