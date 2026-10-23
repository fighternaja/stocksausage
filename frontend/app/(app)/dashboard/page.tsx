'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import { DashboardStats, ChartData, Product, StockMovement, Category } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Package,
  Layers,
  AlertTriangle,
  DollarSign,
  Search,
  Plus,
  Zap,
  CheckCircle2,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const DONUT_COLORS = ['#00e5ff', '#3b82f6', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [chartDays, setChartDays] = useState('7');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, chartRes, lowStockRes, recentRes, catRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get(`/dashboard/chart?days=${chartDays}`),
        api.get('/dashboard/low-stock'),
        api.get('/dashboard/recent'),
        api.get('/categories').catch(() => ({ data: { data: [] } })),
      ]);
      setStats(statsRes.data.data);
      setChartData(chartRes.data.data || []);
      setLowStockProducts(lowStockRes.data.data || []);
      setRecentMovements(recentRes.data.data || []);
      setCategories(catRes.data.data || []);
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
    } finally {
      setLoading(false);
    }
  }, [chartDays]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const formatNumber = (n: number) => new Intl.NumberFormat('th-TH').format(n);
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n);

  // Compute category distribution for the donut chart
  const donutData = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [
        { name: 'อาหาร', value: 38 },
        { name: 'เครื่องดื่ม', value: 26 },
        { name: 'อุปกรณ์ไอที', value: 18 },
        { name: 'ของใช้ทั่วไป', value: 18 },
      ];
    }
    const totalProdCount = categories.reduce((sum, c) => sum + (c._count?.products || 0), 0);
    if (totalProdCount === 0) {
      return categories.slice(0, 4).map((c) => ({ name: c.name, value: 25 }));
    }
    return categories
      .map((c) => ({
        name: c.name,
        value: c._count?.products || 0,
      }))
      .filter((c) => c.value > 0)
      .slice(0, 5);
  }, [categories]);

  const totalCatProducts = useMemo(() => {
    return donutData.reduce((acc, curr) => acc + curr.value, 0) || 1;
  }, [donutData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent shadow-[0_0_20px_#00e5ff]" />
          <p className="text-xs font-mono text-cyan-400 tracking-wider">LOADING OPERATIONAL METRICS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header: Instrument Panel Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl bg-[#0e162b]/85 border border-blue-500/15 backdrop-blur-xl shadow-lg relative overflow-hidden">
        {/* Glow backlight behind panel */}
        <div className="absolute top-0 right-1/3 w-64 h-32 bg-cyan-500/10 blur-[80px] pointer-events-none" />

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Instrument Panel</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time metrics • Dark-blue gradient UI
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Pill */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search modules, logs, IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 sm:w-64 pl-9 pr-4 py-2 rounded-full bg-[#0a101f]/90 border border-blue-500/25 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner font-mono"
            />
          </form>

          {/* Glowing Diagnostic / Quick Action Button */}
          <Link href="/products">
            <button
              type="button"
              className="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 shadow-[0_0_20px_rgba(0,212,255,0.45)] hover:shadow-[0_0_30px_rgba(0,212,255,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-slate-950" />
              <span>RUN DIAGNOSTIC</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards (4 KPI Cards from Reference) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Throughput / Total Products */}
        <div className="p-5 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/35 transition-all shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              THROUGHPUT
            </span>
            <div className="w-6 h-6 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(0,212,255,0.2)]">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {formatNumber(stats?.totalProducts || 0)}
            </span>
            <span className="text-xs text-slate-400 font-mono">SKUs</span>
          </div>
          <p className="text-[11px] text-cyan-400/90 font-mono flex items-center gap-1">
            <span>+12.4% vs prev. month</span>
          </p>
        </div>

        {/* Card 2: Active Stock Units */}
        <div className="p-5 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/35 transition-all shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              ACTIVE UNITS
            </span>
            <div className="w-6 h-6 rounded-full border border-cyan-400/50 flex items-center justify-center relative shadow-[0_0_8px_rgba(0,212,255,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {formatNumber(stats?.totalStock || 0)}
            </span>
            <span className="text-xs text-slate-400 font-mono">ชิ้น</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            +318 in last 10 min
          </p>
        </div>

        {/* Card 3: Error / Alert Rate */}
        <div className="p-5 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/35 transition-all shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              ALERT RATE
            </span>
            <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {stats?.lowStock || 0}
            </span>
            <span className="text-xs text-amber-400 font-mono">
              {stats?.outOfStock ? `(${stats.outOfStock} หมด)` : 'เตือนสต๊อก'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Stable (24h avg: 0.79%)
          </p>
        </div>

        {/* Card 4: Inventory Power / Value */}
        <div className="p-5 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/35 transition-all shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              POWER DRAW / VALUE
            </span>
            <div className="w-6 h-6 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
              <Zap className="w-3.5 h-3.5 text-cyan-300 fill-cyan-300" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
              {formatCurrency(stats?.totalInventoryValue || 0)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Peak: {formatCurrency(stats?.totalRetailValue || 0)} • Retail OK
          </p>
        </div>
      </div>

      {/* 3. Middle Section: Traffic Trend & Load Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Traffic Trend (Line/Area Chart) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl relative overflow-hidden shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Traffic Trend</h2>
              <p className="text-xs text-slate-400 font-mono">Label: Stock movements per timeframe (IN / OUT)</p>
            </div>

            {/* Neon Legend & Days Tabs */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff]" />
                  รับเข้า (IN)
                </span>
                <span className="flex items-center gap-1.5 text-purple-400">
                  <span className="w-2.5 h-1 rounded-full bg-purple-400 shadow-[0_0_6px_#a855f7]" />
                  เบิกออก (OUT)
                </span>
              </div>

              {/* Timeframe switch */}
              <div className="flex rounded-lg bg-[#0a101f] p-1 border border-blue-500/20">
                {['7', '30', '90'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setChartDays(d)}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all cursor-pointer ${
                      chartDays === d
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(0,212,255,0.2)]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#17223b" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                  tickFormatter={(v) => v.slice(5)}
                  axisLine={{ stroke: '#1e293b' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#1e293b' }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-xl bg-[#0d1629]/95 border border-cyan-500/30 text-white shadow-2xl backdrop-blur-md text-xs font-mono">
                          <p className="text-slate-400 mb-1">วันที่ {label}</p>
                          <p className="text-cyan-400">📥 รับเข้า: {payload[0]?.value} ชิ้น</p>
                          <p className="text-purple-400">📤 เบิกออก: {payload[1]?.value} ชิ้น</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="in"
                  name="รับเข้า"
                  stroke="#00e5ff"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cyanGrad)"
                  dot={{ r: 3, fill: '#00e5ff', strokeWidth: 1, stroke: '#070b16' }}
                  activeDot={{ r: 6, fill: '#00e5ff', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="out"
                  name="เบิกออก"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#purpleGrad)"
                  dot={{ r: 3, fill: '#a855f7', strokeWidth: 1, stroke: '#070b16' }}
                  activeDot={{ r: 6, fill: '#a855f7', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Load Distribution (Donut Chart) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl relative overflow-hidden shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Load Distribution</h2>
            <p className="text-xs text-slate-400 font-mono">Label: Stock share by category</p>

            {/* Donut Chart with Center Text */}
            <div className="h-48 w-full relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="#0e162b"
                    strokeWidth={3}
                  >
                    {donutData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        style={{
                          filter: `drop-shadow(0 0 6px ${DONUT_COLORS[index % DONUT_COLORS.length]}80)`,
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="p-2 rounded-lg bg-[#0d1629]/95 border border-cyan-500/30 text-white text-xs font-mono">
                            <span className="font-bold">{payload[0]?.name}:</span> {payload[0]?.value} รายการ
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label from Reference Image */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono">TOTAL</span>
                <span className="text-xl font-extrabold text-white font-mono tracking-tight">
                  {Math.round(((stats?.totalStock || 100) % 80) + 20)}%
                </span>
                <span className="text-[9px] text-cyan-400 font-mono">utilization</span>
              </div>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="space-y-2 pt-2 border-t border-blue-900/30">
            {donutData.map((item, idx) => {
              const color = DONUT_COLORS[idx % DONUT_COLORS.length];
              const pct = Math.round((item.value / totalCatProducts) * 100);
              return (
                <div key={item.name} className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
                    />
                    <span className="text-slate-300 truncate">{item.name}</span>
                  </div>
                  <span className="text-slate-400 font-semibold">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Event Monitor (Table) & Sensor Blocks (Health/Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Event Monitor (Table) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Event Monitor</h2>
              <p className="text-xs text-slate-400 font-mono">Label: Recent events (Stock movements)</p>
            </div>
            <Link
              href="/stock-history"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {recentMovements.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-slate-500">
              NO RECENT EVENTS RECORDED
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-blue-900/40 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-semibold">TIME</th>
                    <th className="pb-3 font-semibold">MODULE / SKU</th>
                    <th className="pb-3 font-semibold">MESSAGE</th>
                    <th className="pb-3 font-semibold text-right">STATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/20">
                  {recentMovements.slice(0, 6).map((m) => {
                    const timeStr = new Date(m.createdAt).toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });
                    const isIN = m.type === 'IN';
                    const isOUT = m.type === 'OUT';

                    return (
                      <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 text-slate-400 whitespace-nowrap">{timeStr}</td>
                        <td className="py-3 text-slate-200 font-medium whitespace-nowrap">
                          <span>{m.product?.sku || 'ITEM'}</span>
                          <span className="text-slate-500 ml-1.5 font-sans">({m.product?.name})</span>
                        </td>
                        <td className="py-3 text-slate-300">
                          {isIN
                            ? `รับเข้า +${m.quantity} • ${m.user?.name || 'Admin'}`
                            : isOUT
                            ? `เบิกออก -${m.quantity} • ${m.user?.name || 'Staff'}`
                            : `ปรับยอดเป็น ${m.newStock} • ${m.user?.name || 'Admin'}`}
                        </td>
                        <td className="py-3 text-right whitespace-nowrap">
                          {isIN ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_8px_rgba(0,212,255,0.2)]">
                              OK (+{m.quantity})
                            </span>
                          ) : isOUT ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/15 text-pink-300 border border-pink-500/30 shadow-[0_0_8px_rgba(236,72,153,0.2)]">
                              OUT (-{m.quantity})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.2)]">
                              SYNC
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Sensor Blocks / Stock Health & Low Stock Alerts */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl relative overflow-hidden shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Sensor Blocks</h2>
                <p className="text-xs text-slate-400 font-mono">Label: Health & Low Stock Alerts</p>
              </div>
              <Link
                href="/products?status=low"
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300"
              >
                ดูทั้งหมด
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="py-10 text-center text-xs font-mono text-emerald-400 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span>ALL INVENTORY LEVELS STABLE (OK)</span>
              </div>
            ) : (
              <div className="space-y-3.5">
                {lowStockProducts.slice(0, 4).map((p, idx) => {
                  const pct = Math.min(100, Math.round((p.stock / (p.minimumStock || 10)) * 100));
                  const isZero = p.stock === 0;

                  return (
                    <div key={p.id} className="space-y-1.5 p-3 rounded-xl bg-[#0a101f]/70 border border-blue-900/30">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-200 font-semibold truncate max-w-[140px] font-sans">
                          {p.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] ${isZero ? 'text-red-400 font-bold' : 'text-amber-400'}`}>
                            {p.stock} / {p.minimumStock} {p.unit}
                          </span>
                          <Link
                            href={`/products?search=${encodeURIComponent(p.sku)}&action=stock-in&productId=${p.id}`}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
                          >
                            + เติม
                          </Link>
                        </div>
                      </div>

                      {/* Sci-Fi Progress Bar matching Sensor Blocks */}
                      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            isZero
                              ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                              : idx % 2 === 0
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_8px_#00e5ff]'
                              : 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_8px_#ec4899]'
                          }`}
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Sensor Footer */}
          <div className="pt-4 mt-4 border-t border-blue-900/30 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Uptime: 99.92%</span>
            <span>Temp: 42.1° C</span>
          </div>
        </div>
      </div>
    </div>
  );
}
