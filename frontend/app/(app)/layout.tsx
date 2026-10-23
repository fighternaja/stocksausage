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
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  Layers,
  Activity,
  SlidersHorizontal,
  CircleDot,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const mainNavItems = [
  { name: 'Overview', href: '/dashboard', labelTh: 'ภาพรวม', icon: LayoutDashboard },
  { name: 'Products', href: '/products', labelTh: 'สินค้า', icon: Package },
  { name: 'Categories', href: '/categories', labelTh: 'หมวดหมู่', icon: Tags },
  { name: 'History', href: '/stock-history', labelTh: 'ประวัติสต๊อก', icon: History },
];

const adminNavItems = [
  { name: 'Users', href: '/users', labelTh: 'ผู้ใช้งาน', icon: Users },
];

// Left sidebar component matching the reference image layout
function SidebarDeck({
  pathname,
  isAdmin,
  onNavigate,
}: {
  pathname: string;
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const [quickSearch, setQuickSearch] = useState('');
  const [activeZone, setActiveZone] = useState<'A' | 'B'>('A');

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] text-slate-200 select-none overflow-y-auto px-3.5 py-4 space-y-4">
      {/* Navigation section */}
      <div className="space-y-1.5">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-[#10192e] text-cyan-300 border border-cyan-500/40 shadow-[0_0_18px_rgba(34,211,238,0.18)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                    : 'bg-white/[0.03] text-slate-400 group-hover:text-slate-200'
                }`}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight font-medium">{item.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">{item.labelTh}</span>
              </div>
            </Link>
          );
        })}

        {isAdmin &&
          adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#10192e] text-cyan-300 border border-cyan-500/40 shadow-[0_0_18px_rgba(34,211,238,0.18)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                      : 'bg-white/[0.03] text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="leading-tight font-medium">{item.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{item.labelTh}</span>
                </div>
              </Link>
            );
          })}
      </div>

      {/* Quick Search in Sidebar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          placeholder="Quick search"
          className="w-full bg-[#0e1424] border border-slate-800/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/50 transition-colors"
        />
      </div>

      {/* Categories / Rooms Widget (As seen in Reference UI) */}
      <div className="rounded-2xl bg-[#0e1526]/90 border border-slate-800/70 p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200">Categories</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            All
          </span>
        </div>
        <div className="space-y-2 text-xs">
          <Link
            href="/products?category=อาหาร"
            onClick={onNavigate}
            className="flex items-center justify-between group hover:text-cyan-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
              <span className="text-slate-300 group-hover:text-cyan-300">อาหาร</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">18 active</span>
          </Link>
          <Link
            href="/products?category=เครื่องดื่ม"
            onClick={onNavigate}
            className="flex items-center justify-between group hover:text-cyan-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" />
              <span className="text-slate-300 group-hover:text-cyan-300">เครื่องดื่ม</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">12 active</span>
          </Link>
          <Link
            href="/products?category=อุปกรณ์ไอที"
            onClick={onNavigate}
            className="flex items-center justify-between group hover:text-cyan-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]" />
              <span className="text-slate-300 group-hover:text-cyan-300">อุปกรณ์ไอที</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">8 active</span>
          </Link>
          <Link
            href="/products?category=ของใช้ทั่วไป"
            onClick={onNavigate}
            className="flex items-center justify-between group hover:text-cyan-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
              <span className="text-slate-300 group-hover:text-cyan-300">ของใช้ทั่วไป</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">6 active</span>
          </Link>
        </div>
      </div>

      {/* Layout / Zone Selector (As seen in Reference UI) */}
      <div className="rounded-2xl bg-[#0e1526]/90 border border-slate-800/70 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Layout</span>
          <span className="text-[10px] text-cyan-400 font-mono">Active 2 zones</span>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-[#090d18] rounded-xl border border-slate-800/60">
          <button
            onClick={() => setActiveZone('A')}
            className={`flex-1 py-1 rounded-lg text-[11px] font-medium transition-all ${
              activeZone === 'A'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Zone Alpha
          </button>
          <button
            onClick={() => setActiveZone('B')}
            className={`flex-1 py-1 rounded-lg text-[11px] font-medium transition-all ${
              activeZone === 'B'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Zone Beta
          </button>
        </div>
      </div>

      {/* Notifications mini feed (As seen in Reference UI) */}
      <div className="rounded-2xl bg-[#0e1526]/90 border border-slate-800/70 p-3.5 space-y-2.5 mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Notifications</span>
          <span className="text-[10px] font-semibold text-cyan-400">New</span>
        </div>
        <div className="space-y-2 text-[11px]">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
              รับเข้าสต๊อก #402
            </span>
            <span className="text-[10px] text-slate-400 font-mono">2m</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
              เตือนสินค้าใกล้หมด
            </span>
            <span className="text-[10px] text-slate-400 font-mono">5m</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" />
              ระบบบันทึกสต๊อก
            </span>
            <span className="text-[10px] text-slate-400 font-mono">10m</span>
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
  const [headerSearch, setHeaderSearch] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070b14]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shadow-[0_0_20px_#22d3ee]" />
          <span className="text-xs font-medium text-cyan-300 tracking-wider font-mono">INITIALIZING DECK...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      router.push(`/products?search=${encodeURIComponent(headerSearch.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080f] text-slate-100 flex flex-col p-2 lg:p-4 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Outer Sleek App Container (macOS / Smart Deck Frame) */}
      <div className="flex-1 flex flex-col bg-[#0b0f1d] border border-slate-800/80 rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Header Deck (Exact match with reference image) */}
        <header className="h-16 lg:h-18 border-b border-slate-800/80 bg-[#090d1a]/95 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between gap-4 shrink-0">
          {/* Left: Window controls & Logo */}
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
            {/* macOS window dots */}
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 hover:opacity-100 transition-opacity" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 hover:opacity-100 transition-opacity" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 hover:opacity-100 transition-opacity" />
            </div>

            {/* Mobile menu button */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-white/5 text-slate-300 lg:hidden cursor-pointer border border-slate-800">
                <Menu className="h-4 w-4" />
              </SheetTrigger>
            </Sheet>

            {/* Glowing cyan ring logo and title */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              {/* Cyan Donut / Torus Logo */}
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full border-[3px] border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] group-hover:shadow-[0_0_22px_rgba(34,211,238,0.8)] transition-all">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm lg:text-base font-bold text-white tracking-tight">Stock control</span>
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:inline">Unified responsive inventory system</span>
              </div>
            </Link>
          </div>

          {/* Center Navigation Tabs (Overview, Products, Categories, Automation) */}
          <nav className="hidden xl:flex items-center gap-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_6px_#22d3ee]" />
                  )}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/users"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all relative ${
                  pathname === '/users'
                    ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                Users
              </Link>
            )}
          </nav>

          {/* Top Quick Status Chips (As seen in Reference: Rooms 08, Devices 24, Scenes 05, Alerts 03) */}
          <div className="hidden 2xl:flex items-center gap-2 bg-[#0c1222] px-3 py-1 rounded-full border border-slate-800 text-[11px] font-mono">
            <span className="text-slate-400">SKUs <strong className="text-cyan-300">48</strong></span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">Stock <strong className="text-emerald-400">1.2k</strong></span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">Categories <strong className="text-purple-300">04</strong></span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1 text-slate-400">
              Alerts <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
              <strong className="text-amber-400">01</strong>
            </span>
          </div>

          {/* Search bar & Right Controls */}
          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            {/* Search Pill */}
            <form onSubmit={handleHeaderSearch} className="relative hidden md:block w-44 lg:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search device or SKU"
                className="w-full bg-[#0c1222] border border-slate-800 hover:border-slate-700 rounded-full pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </form>

            {/* Timeframe selector pill */}
            <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-[#0c1222] border border-slate-800 text-xs text-slate-300 font-medium">
              <span>This week</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {/* Live Indicator Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-[0_0_10px_rgba(16,185,129,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              <span>Live</span>
            </div>

            {/* Notification Bell Pill */}
            <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0c1222] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors relative">
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
            </button>

            {/* User Profile Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center outline-none cursor-pointer">
                <Avatar className="h-8 w-8 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]">
                  <AvatarFallback className="bg-gradient-to-tr from-cyan-600 to-blue-600 text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-[#0c1222] border border-slate-800 text-slate-200 shadow-2xl rounded-2xl p-2">
                <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                  <p className="text-xs font-bold text-white">{user.name}</p>
                  <p className="text-[10px] text-cyan-400 font-mono mt-0.5">{user.role}</p>
                </div>
                <DropdownMenuItem
                  onClick={logout}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl cursor-pointer text-xs"
                >
                  <LogOut className="h-3.5 w-3.5 mr-2" />
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Body: Sidebar + Main Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Left Sidebar Deck */}
          <aside className="hidden lg:flex lg:flex-col lg:w-60 xl:w-64 border-r border-slate-800/80 bg-[#090e1a] shrink-0">
            <SidebarDeck pathname={pathname} isAdmin={isAdmin} />
          </aside>

          {/* Mobile Sidebar Sheet */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-68 p-0 bg-[#090e1a] border-r border-slate-800">
              <SidebarDeck pathname={pathname} isAdmin={isAdmin} onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Main Dynamic Viewport */}
          <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 bg-[#080c18] relative">
            {/* Ambient Background Glow Orbs */}
            <div className="absolute top-8 right-1/4 w-[380px] h-[380px] rounded-full bg-cyan-600/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-8 left-1/4 w-[380px] h-[380px] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
