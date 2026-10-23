'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { StockMovement, Product, PaginatedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  SlidersHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';

export default function StockHistoryPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  // Filters
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Fetch product list for filter dropdown
  const fetchProductsList = useCallback(async () => {
    try {
      const res = await api.get('/products?limit=100');
      setProducts(res.data.data?.items || []);
    } catch {
      // ignore
    }
  }, []);

  // Fetch stock movements
  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (selectedType !== 'ALL') params.append('type', selectedType);
      if (selectedProduct) params.append('productId', selectedProduct);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/stock/movements?${params.toString()}`);
      const data: PaginatedData<StockMovement> = res.data.data;
      setMovements(data.items || []);
      setPagination((prev) => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages,
      }));
    } catch {
      toast.error('ไม่สามารถโหลดประวัติสต๊อกได้');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, selectedType, selectedProduct, startDate, endDate]);

  useEffect(() => {
    fetchProductsList();
  }, [fetchProductsList]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const handleResetFilters = () => {
    setSelectedType('ALL');
    setSelectedProduct('');
    setStartDate('');
    setEndDate('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatNumber = (n: number) => new Intl.NumberFormat('th-TH').format(n);

  // Shared dark select class
  const selectClass =
    'flex h-9 w-full rounded-xl border border-blue-500/25 bg-[#0a101f]/90 px-3 py-1 text-sm text-slate-200 shadow-xs transition-colors focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0e162b]/85 border border-blue-500/15 backdrop-blur-xl shadow-lg">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <span>ประวัติการเคลื่อนไหวสต๊อก</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          ตรวจสอบประวัติการรับเข้า เบิกออก และการปรับยอดสินค้าทั้งหมด
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          {/* Filter by Type */}
          <div className="w-full lg:w-44">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={selectClass}
            >
              <option value="ALL">ทุกประเภทรายการ</option>
              <option value="IN">รับเข้า (IN)</option>
              <option value="OUT">เบิกออก (OUT)</option>
              <option value="ADJUSTMENT">ปรับปรุง (ADJUSTMENT)</option>
            </select>
          </div>

          {/* Filter by Product */}
          <div className="w-full lg:w-56">
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={selectClass}
            >
              <option value="">ทุกสินค้า</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="h-9 text-xs rounded-xl bg-[#0a101f]/90 border-blue-500/25 text-slate-200 focus:border-cyan-400 focus:ring-cyan-500/20"
              title="ตั้งแต่วันที่"
            />
            <span className="text-slate-500 text-xs">ถึง</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="h-9 text-xs rounded-xl bg-[#0a101f]/90 border-blue-500/25 text-slate-200 focus:border-cyan-400 focus:ring-cyan-500/20"
              title="ถึงวันที่"
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={handleResetFilters}
            className="h-9 px-4 rounded-xl flex items-center gap-1.5 text-sm text-slate-400 border border-blue-900/40 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            รีเซ็ตตัวกรอง
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-blue-900/40 bg-[#0a101f]/90 hover:bg-[#0a101f]/90">
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono py-3 w-40">วัน-เวลา</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono py-3">สินค้า</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono text-center py-3 w-28">ประเภท</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono text-right py-3 w-28">จำนวน</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono text-center py-3 w-36">ก่อนหน้า → ใหม่</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono py-3">หมายเหตุ</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono py-3 w-36">ผู้ทำรายการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center border-b border-blue-900/20">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-cyan-400 border-t-transparent shadow-[0_0_15px_#00e5ff]" />
                      <span className="text-xs font-mono text-cyan-400 tracking-wider">LOADING DATA...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center border-b border-blue-900/20">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History className="h-8 w-8 text-slate-600" />
                      <span className="text-sm text-slate-500">ไม่พบข้อมูลประวัติการเคลื่อนไหวสต๊อก</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((m) => (
                  <TableRow key={m.id} className="border-b border-blue-900/20 hover:bg-blue-500/5 transition-colors">
                    <TableCell className="text-xs text-slate-400 whitespace-nowrap font-mono py-3">
                      {new Date(m.createdAt).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="font-medium text-slate-200">{m.product?.name || 'สินค้าที่ถูกลบ'}</div>
                      <div className="font-mono text-xs text-slate-500">{m.product?.sku || '-'}</div>
                    </TableCell>
                    <TableCell className="text-center py-3">
                      {m.type === 'IN' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <ArrowUpCircle className="h-3 w-3" />
                          รับเข้า
                        </span>
                      )}
                      {m.type === 'OUT' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <ArrowDownCircle className="h-3 w-3" />
                          เบิกออก
                        </span>
                      )}
                      {m.type === 'ADJUSTMENT' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          <SlidersHorizontal className="h-3 w-3" />
                          ปรับยอด
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold font-mono py-3">
                      {m.type === 'IN' && (
                        <span className="text-emerald-400">+{formatNumber(m.quantity)}</span>
                      )}
                      {m.type === 'OUT' && (
                        <span className="text-rose-400">-{formatNumber(m.quantity)}</span>
                      )}
                      {m.type === 'ADJUSTMENT' && (
                        <span className="text-indigo-400">{formatNumber(m.quantity)}</span>
                      )}
                      <span className="text-xs text-slate-500 ml-1">{m.product?.unit || 'ชิ้น'}</span>
                    </TableCell>
                    <TableCell className="text-center text-sm font-mono py-3">
                      <span className="text-slate-400">{m.previousStock}</span>
                      <span className="mx-1 text-slate-600">→</span>
                      <span className="font-bold text-cyan-300">{m.newStock}</span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 max-w-xs truncate py-3">
                      {m.note || <span className="text-slate-600">-</span>}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                        <UserIcon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>{m.user?.name || '-'}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-blue-900/30 bg-[#0a101f]/60 text-sm">
          <div className="text-slate-400 font-mono text-xs">
            ทั้งหมด <span className="font-bold text-cyan-300">{pagination.total}</span> รายการ (หน้า{' '}
            <span className="font-bold text-slate-200">{pagination.page}</span> จาก{' '}
            <span className="font-bold text-slate-200">{pagination.totalPages || 1}</span>)
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1 || loading}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="h-8 px-3 rounded-xl flex items-center gap-1 text-xs text-slate-400 border border-blue-900/40 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              ก่อนหน้า
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="h-8 px-3 rounded-xl flex items-center gap-1 text-xs text-slate-400 border border-blue-900/40 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ถัดไป
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
