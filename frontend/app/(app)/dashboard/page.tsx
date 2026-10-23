'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import { DashboardStats, ChartData, Product, StockMovement, Category } from '@/types';
import {
  Package,
  Layers,
  AlertTriangle,
  Search,
  Plus,
  Zap,
  CheckCircle2,
  Activity,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Flame,
  Radio,
  Clock,
  Wifi,
  Database,
  Camera,
  Cpu,
  RefreshCw,
  Bell,
  Sun,
  Shield,
  Eye,
  Sliders,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// iOS / Smart-Home Neon Toggle Switch matching the user's reference image
function NeonToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 cursor-pointer ${
        checked
          ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)] justify-end'
          : 'bg-[#0b101c] border border-slate-700/80 justify-start'
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full transition-all duration-300 ${
          checked ? 'bg-[#080c16] shadow-sm' : 'bg-slate-500'
        }`}
      />
    </button>
  );
}

// Circular Arc Gauge Meter (Matching the reference "46% Humidity" circular gauge)
function CircularArcGauge({ value = 78, label = 'Stock Health' }: { value?: number; label?: string }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const strokeDashoffset = circumference - (circumference * Math.min(100, Math.max(0, value))) / 100;

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
        {/* Background track circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="7"
          fill="transparent"
        />
        {/* Glowing cyan arc */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#22d3ee"
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out filter drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]"
        />
      </svg>
      {/* Center percentage label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-extrabold text-white font-mono tracking-tight">{value}%</span>
        <span className="text-[9px] text-slate-400 font-medium">{label}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [chartDays, setChartDays] = useState('7');
  const [loading, setLoading] = useState(true);

  // Interactive switch states (Devices & Automation Scenes from Reference)
  const [autoReorder, setAutoReorder] = useState(true);
  const [barcodeScanner, setBarcodeScanner] = useState(true);
  const [entrySensor, setEntrySensor] = useState(true);
  const [airPurifier, setAirPurifier] = useState(false);

  // Scenes
  const [sceneMorning, setSceneMorning] = useState(true);
  const [sceneAway, setSceneAway] = useState(true);
  const [sceneNight, setSceneNight] = useState(false);

  // Filter chips in Hero card
  const [heroFilter, setHeroFilter] = useState<'all' | 'in' | 'low'>('all');

  // Rule builder inputs
  const [ruleTrigger, setRuleTrigger] = useState('Stock < Min threshold');
  const [ruleAction, setRuleAction] = useState('Auto PO & Line Alert');

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, chartRes, lowStockRes, recentRes, catRes] = await Promise.all([
        api.get('/dashboard/stats').catch(() => ({ data: { data: null } })),
        api.get(`/dashboard/chart?days=${chartDays}`).catch(() => ({ data: { data: [] } })),
        api.get('/dashboard/low-stock').catch(() => ({ data: { data: [] } })),
        api.get('/dashboard/recent').catch(() => ({ data: { data: [] } })),
        api.get('/categories').catch(() => ({ data: { data: [] } })),
      ]);

      if (statsRes.data?.data) setStats(statsRes.data.data);
      if (chartRes.data?.data) setChartData(chartRes.data.data);
      if (lowStockRes.data?.data) setLowStockProducts(lowStockRes.data.data);
      if (recentRes.data?.data) setRecentMovements(recentRes.data.data);
      if (catRes.data?.data) setCategories(catRes.data.data);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, [chartDays]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatNumber = (n: number) => new Intl.NumberFormat('th-TH').format(n);
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n);

  // Compute stock health percentage (default to 86% if no stats)
  const stockHealthPct = useMemo(() => {
    if (!stats || !stats.totalProducts) return 86;
    const healthy = Math.max(0, stats.totalProducts - (stats.lowStock || 0) - (stats.outOfStock || 0));
    return Math.round((healthy / stats.totalProducts) * 100);
  }, [stats]);

  // Fallback 7-day movement data for the glowing bar chart if chartData is empty
  const weeklyBarData = useMemo(() => {
    if (chartData && chartData.length >= 7) {
      return chartData.slice(-7).map((d, i) => {
        const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        return {
          day: days[i] || d.date.slice(5),
          in: d.in || 0,
          out: d.out || 0,
          total: (d.in || 0) + (d.out || 0),
        };
      });
    }
    return [
      { day: 'M', in: 14, out: 8, total: 22 },
      { day: 'T', in: 18, out: 12, total: 30 },
      { day: 'W', in: 22, out: 9, total: 31 },
      { day: 'T', in: 34, out: 16, total: 50 },
      { day: 'F', in: 48, out: 24, total: 72, isPeak: true },
      { day: 'S', in: 28, out: 18, total: 46 },
      { day: 'S', in: 20, out: 14, total: 34 },
    ];
  }, [chartData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[480px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent shadow-[0_0_20px_#22d3ee]" />
          <p className="text-xs font-mono text-cyan-300 tracking-wider">SYNCING DASHBOARD DECK...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* ============================================================== */}
      {/* ROW 1: Hero Scene Overview & Energy/Flow Bar Chart             */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* Left Hero Card: "Living Room / Warehouse Alpha" style from Reference */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0f1628]/90 border border-slate-800/80 p-5 lg:p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-1/4 w-52 h-52 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Top header row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Main Warehouse</h2>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
              </div>
              <p className="text-xs text-slate-400">Responsive scene overview</p>
            </div>

            {/* Mode badge (like "Comfort mode" in reference) */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-[0_0_12px_rgba(34,211,238,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Optimal Mode</span>
            </div>
          </div>

          {/* Filter pills: All, Active, Alerts (Like Lights, Climate, Audio in reference) */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setHeroFilter('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                heroFilter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-[#090d18] text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>All Stock</span>
            </button>
            <button
              onClick={() => setHeroFilter('in')}
              className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                heroFilter === 'in'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-[#090d18] text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>In Stock</span>
            </button>
            <button
              onClick={() => setHeroFilter('low')}
              className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                heroFilter === 'low'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-[#090d18] text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Alerts ({stats?.lowStock || 0})</span>
            </button>
          </div>

          {/* Middle Body: Giant primary metric & Circular gauge */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-mono">
                  {formatNumber(stats?.totalStock || 1280)}
                </span>
                <span className="text-sm font-semibold text-cyan-400">units</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Target 1,500 • Capacity 85%</p>

              {/* Sub-metrics row (Active 12, Reserved 3, Alerts 1) */}
              <div className="flex items-center gap-4 mt-5 text-xs font-mono">
                <div>
                  <p className="text-slate-400">Total SKUs</p>
                  <p className="text-sm font-bold text-white mt-0.5">{stats?.totalProducts || 48}</p>
                </div>
                <div className="w-[1px] h-6 bg-slate-800" />
                <div>
                  <p className="text-slate-400">Categories</p>
                  <p className="text-sm font-bold text-white mt-0.5">{categories.length || 4}</p>
                </div>
                <div className="w-[1px] h-6 bg-slate-800" />
                <div>
                  <p className="text-slate-400">Low Stock</p>
                  <p className="text-sm font-bold text-amber-400 mt-0.5">{stats?.lowStock || 1}</p>
                </div>
              </div>
            </div>

            {/* Right side: Circular Gauge Ring (Matching Reference 46% Humidity Dial) */}
            <div className="shrink-0">
              <CircularArcGauge value={stockHealthPct} label="Health" />
            </div>
          </div>
        </div>

        {/* Right Hero Card: "Energy dashboard / Stock Flow Dashboard" style */}
        <div className="lg:col-span-5 rounded-3xl bg-[#0f1628]/90 border border-slate-800/80 p-5 lg:p-6 shadow-xl relative overflow-hidden backdrop-blur-xl flex flex-col justify-between">
          <div>
            {/* Header with Day/Week/Month pills */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white tracking-tight">Stock flow dashboard</h2>
              <div className="flex rounded-full bg-[#0a0e1a] p-1 border border-slate-800 text-[11px] font-medium">
                <button className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Day
                </button>
                <button className="px-2.5 py-0.5 text-slate-400 hover:text-slate-200">Week</button>
                <button className="px-2.5 py-0.5 text-slate-400 hover:text-slate-200">Month</button>
              </div>
            </div>

            {/* Metrics row: Consumption & In/Out indicators */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] text-slate-400">Flow Volume</p>
                <p className="text-xl font-bold text-white font-mono">14.8k <span className="text-xs font-normal text-slate-400">units</span></p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-cyan-400">● Inward</span>
                  <p className="text-xs font-bold text-white">4.2k</p>
                </div>
                <div>
                  <span className="text-[10px] text-purple-400">● Outward</span>
                  <p className="text-xs font-bold text-white">10.6k</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart with rounded purple-to-cyan gradient bars (Like in screenshot) */}
          <div className="relative pt-6 pb-1">
            {/* Peak tooltip indicator */}
            <div className="absolute top-0 right-1/3 -translate-x-1/2 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[9px] shadow-[0_0_10px_#22d3ee]">
              Peak 18.2
            </div>

            {/* 7 Glowing Bar pills */}
            <div className="flex items-end justify-between gap-2 h-28 px-2">
              {weeklyBarData.map((bar, idx) => {
                const maxVal = Math.max(...weeklyBarData.map((b) => b.total), 1);
                const heightPercent = Math.max(20, Math.round((bar.total / maxVal) * 100));
                const isPeak = idx === 4 || bar.isPeak;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex items-end justify-center h-24">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-3.5 sm:w-4 rounded-full transition-all duration-500 relative ${
                          isPeak
                            ? 'bg-gradient-to-t from-purple-500 via-indigo-400 to-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.7)]'
                            : 'bg-gradient-to-t from-purple-600/70 to-indigo-400/80 hover:to-cyan-400/80 group-hover:shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                        }`}
                      >
                        {isPeak && (
                          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{bar.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ROW 2: Devices (Operations Controls) & Temperature/Stock Trend */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* Left: Devices / Operations Controls (4 tiles matching Reference) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0f1628]/90 border border-slate-800/80 p-5 lg:p-6 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">Devices & Operations</h2>
            <div className="flex rounded-full bg-[#0a0e1a] p-1 border border-slate-800 text-[11px] font-medium">
              <button className="px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                All
              </button>
              <button className="px-3 py-0.5 text-slate-400 hover:text-slate-200">On</button>
            </div>
          </div>

          {/* 2x2 Device Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tile 1: Auto Re-order (Ceiling light style) */}
            <div className="rounded-2xl bg-[#0d1324] border border-slate-800/80 hover:border-cyan-500/30 p-3.5 flex items-center justify-between transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Auto re-order
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">78% Auto</p>
                </div>
              </div>
              <NeonToggle checked={autoReorder} onChange={() => setAutoReorder(!autoReorder)} />
            </div>

            {/* Tile 2: Barcode Scanner (Thermostat style) */}
            <div className="rounded-2xl bg-[#0d1324] border border-slate-800/80 hover:border-cyan-500/30 p-3.5 flex items-center justify-between transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)]">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Barcode deck
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">Online</p>
                </div>
              </div>
              <NeonToggle checked={barcodeScanner} onChange={() => setBarcodeScanner(!barcodeScanner)} />
            </div>

            {/* Tile 3: Entry Camera / Sensor (Entry camera style) */}
            <div className="rounded-2xl bg-[#0d1324] border border-slate-800/80 hover:border-cyan-500/30 p-3.5 flex items-center justify-between transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Security gate
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">Armed</p>
                </div>
              </div>
              <NeonToggle checked={entrySensor} onChange={() => setEntrySensor(!entrySensor)} />
            </div>

            {/* Tile 4: DB Sync / Air Purifier (Air purifier style) */}
            <div className="rounded-2xl bg-[#0d1324] border border-slate-800/80 hover:border-cyan-500/30 p-3.5 flex items-center justify-between transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Cloud sync
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">Eco (10m)</p>
                </div>
              </div>
              <NeonToggle checked={airPurifier} onChange={() => setAirPurifier(!airPurifier)} />
            </div>
          </div>
        </div>

        {/* Right: Temperature trend / Inventory spline chart */}
        <div className="lg:col-span-5 rounded-3xl bg-[#0f1628]/90 border border-slate-800/80 p-5 lg:p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Stock trend</h2>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-0.5">
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-2 h-0.5 bg-cyan-400 rounded-full" /> Actual
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-0.5 bg-emerald-400 rounded-full" /> Target
                </span>
              </div>
            </div>

            {/* Timeframe selector: 24h, 7d */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-full bg-[#0a0e1a] p-1 border border-slate-800 text-[11px] font-mono">
                <button
                  onClick={() => setChartDays('7')}
                  className={`px-2.5 py-0.5 rounded-full transition-all ${
                    chartDays === '7'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  24 h
                </button>
                <button
                  onClick={() => setChartDays('30')}
                  className={`px-2.5 py-0.5 rounded-full transition-all ${
                    chartDays === '30'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  7 d
                </button>
              </div>
            </div>
          </div>

          {/* Spline Area Chart */}
          <div className="relative h-44 w-full">
            {/* Peak tooltip badge */}
            <div className="absolute top-1 right-8 px-2 py-0.5 rounded-full bg-[#11192d] border border-cyan-500/40 text-cyan-300 text-[10px] font-mono shadow-[0_0_8px_rgba(34,211,238,0.3)] z-10">
              Peak 22.8°
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={
                  chartData && chartData.length > 0
                    ? chartData
                    : [
                        { date: '1', in: 12, out: 8, adjustment: 0 },
                        { date: '2', in: 18, out: 14, adjustment: 0 },
                        { date: '3', in: 15, out: 11, adjustment: 0 },
                        { date: '4', in: 25, out: 16, adjustment: 0 },
                        { date: '5', in: 32, out: 19, adjustment: 0 },
                        { date: '6', in: 26, out: 18, adjustment: 0 },
                        { date: '7', in: 21, out: 13, adjustment: 0 },
                      ]
                }
                margin={{ top: 20, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="trendCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#162035" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2 rounded-xl bg-[#0c1222] border border-cyan-500/30 text-white text-xs font-mono shadow-xl">
                          <p className="text-cyan-400">Actual: {payload[0]?.value}</p>
                          <p className="text-emerald-400">Target: {payload[1]?.value || 20}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="in"
                  stroke="#22d3ee"
                  strokeWidth={2.5}
                  fill="url(#trendCyan)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#22d3ee', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="out"
                  stroke="#34d399"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="transparent"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ROW 3: Camera Previews / Storage Zones & Automation Scenes     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* Left: Camera previews (Storage Zones from Reference) */}
        <div className="lg:col-span-6 rounded-3xl bg-[#0f1628]/90 border border-slate-800/80 p-5 lg:p-6 shadow-xl backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">Camera previews</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              2 active
            </span>
          </div>

          {/* 2 Camera / Shelf Preview Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Camera Box 1: Entry */}
            <div className="rounded-2xl bg-[#0b101c] border border-slate-800 p-3 space-y-2">
              <div className="h-24 rounded-xl bg-gradient-to-br from-[#121a2d] to-[#090d18] relative overflow-hidden flex items-center justify-center border border-slate-800/60">
                <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:12px_12px] opacity-15" />
                <Package className="w-8 h-8 text-cyan-400/40" />
                <span className="absolute top-2 left-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-slate-300">
                  Entry
                </span>
                <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono text-center">Zone Alpha: Receiving Area</p>
            </div>

            {/* Camera Box 2: Patio */}
            <div className="rounded-2xl bg-[#0b101c] border border-slate-800 p-3 space-y-2">
              <div className="h-24 rounded-xl bg-gradient-to-br from-[#121a2d] to-[#090d18] relative overflow-hidden flex items-center justify-center border border-slate-800/60">
                <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:12px_12px] opacity-15" />
                <Layers className="w-8 h-8 text-purple-400/40" />
                <span className="absolute top-2 left-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-slate-300">
                  Main
                </span>
                <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono text-center">Zone Beta: Bulk Storage</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">Saved clips update automatically when motion is detected.</p>
        </div>

        {/* Right: Automation scenes (Rule builder & Task states from Reference) */}
        <div className="lg:col-span-6 rounded-3xl bg-[#0f1628]/90 border border-slate-800/80 p-5 lg:p-6 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">Automation scenes</h2>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <button className="text-cyan-300 border-b border-cyan-400 pb-0.5">Rules</button>
              <button className="hover:text-slate-200">History</button>
            </div>
          </div>

          {/* 3 Scene Quick Toggles (Morning, Away, Night) */}
          <div className="flex items-center justify-between gap-2 p-2 bg-[#0b101c] rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 px-2">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Morning
                </p>
                <p className="text-[10px] text-slate-400 font-mono">07:00</p>
              </div>
              <NeonToggle checked={sceneMorning} onChange={() => setSceneMorning(!sceneMorning)} />
            </div>

            <div className="w-[1px] h-8 bg-slate-800" />

            <div className="flex items-center gap-2 px-2">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Receiving
                </p>
                <p className="text-[10px] text-slate-400 font-mono">Auto</p>
              </div>
              <NeonToggle checked={sceneAway} onChange={() => setSceneAway(!sceneAway)} />
            </div>

            <div className="w-[1px] h-8 bg-slate-800" />

            <div className="flex items-center gap-2 px-2">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Night
                </p>
                <p className="text-[10px] text-slate-400 font-mono">22:30</p>
              </div>
              <NeonToggle checked={sceneNight} onChange={() => setSceneNight(!sceneNight)} />
            </div>
          </div>

          {/* Split: Rule Builder & Task States */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Rule builder */}
            <div className="p-3 bg-[#0b101c] rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300">Rule builder</span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between bg-[#11182c] px-2.5 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Trigger</span>
                  <span className="text-slate-200 text-[11px]">{ruleTrigger}</span>
                </div>
                <div className="flex items-center justify-between bg-[#11182c] px-2.5 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Action</span>
                  <span className="text-slate-200 text-[11px]">{ruleAction}</span>
                </div>
              </div>
              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Confidence: 99%</span>
                <span className="text-cyan-400 cursor-pointer hover:underline">Edit</span>
              </div>
            </div>

            {/* Task states */}
            <div className="p-3 bg-[#0b101c] rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300">Task states</span>
              <div className="space-y-1 text-[11px] font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Hall camera</span>
                  <span className="text-cyan-400">Armed • 10:30</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Auto-Restock</span>
                  <span className="text-emerald-400">Auto • 15:00</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Daily Audit</span>
                  <span className="text-purple-400">Eco • 21:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
