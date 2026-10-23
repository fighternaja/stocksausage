'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { StockMovement, Product, PaginatedData } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ประวัติการเคลื่อนไหวสต๊อก</h1>
        <p className="text-muted-foreground">
          ตรวจสอบประวัติการรับเข้า เบิกออก และการปรับยอดสินค้าทั้งหมด
        </p>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            {/* Filter by Type */}
            <div className="w-full lg:w-44">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                className="h-9 text-xs"
                title="ตั้งแต่วันที่"
              />
              <span className="text-muted-foreground text-xs">ถึง</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="h-9 text-xs"
                title="ถึงวันที่"
              />
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="h-9 px-3 gap-1.5 shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              รีเซ็ตตัวกรอง
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-40">วัน-เวลา</TableHead>
                <TableHead>สินค้า</TableHead>
                <TableHead className="text-center w-28">ประเภท</TableHead>
                <TableHead className="text-right w-28">จำนวน</TableHead>
                <TableHead className="text-center w-36">ก่อนหน้า → ใหม่</TableHead>
                <TableHead>หมายเหตุ / เหตุผล</TableHead>
                <TableHead className="w-36">ผู้ทำรายการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
                      <span className="text-xs text-muted-foreground">กำลังโหลดข้อมูล...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History className="h-8 w-8 text-muted-foreground/50" />
                      <span>ไม่พบข้อมูลประวัติการเคลื่อนไหวสต๊อก</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((m) => (
                  <TableRow key={m.id} className="hover:bg-muted/40">
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{m.product?.name || 'สินค้าที่ถูกลบ'}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {m.product?.sku || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {m.type === 'IN' && (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 gap-1">
                          <ArrowUpCircle className="h-3 w-3" />
                          รับเข้า
                        </Badge>
                      )}
                      {m.type === 'OUT' && (
                        <Badge variant="destructive" className="gap-1">
                          <ArrowDownCircle className="h-3 w-3" />
                          เบิกออก
                        </Badge>
                      )}
                      {m.type === 'ADJUSTMENT' && (
                        <Badge variant="secondary" className="gap-1 text-indigo-700 bg-indigo-100 border-indigo-200">
                          <SlidersHorizontal className="h-3 w-3" />
                          ปรับยอด
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {m.type === 'IN' && (
                        <span className="text-emerald-600">+{formatNumber(m.quantity)}</span>
                      )}
                      {m.type === 'OUT' && (
                        <span className="text-rose-600">-{formatNumber(m.quantity)}</span>
                      )}
                      {m.type === 'ADJUSTMENT' && (
                        <span className="text-indigo-600">{formatNumber(m.quantity)}</span>
                      )}
                      <span className="text-xs text-muted-foreground ml-1">
                        {m.product?.unit || 'ชิ้น'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm font-mono text-muted-foreground">
                      <span className="text-foreground">{m.previousStock}</span>
                      <span className="mx-1 text-muted-foreground">→</span>
                      <span className="font-bold text-foreground">{m.newStock}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {m.note || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                        <UserIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
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
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20 text-sm">
          <div className="text-muted-foreground">
            ทั้งหมด <span className="font-medium text-foreground">{pagination.total}</span> รายการ (หน้า{' '}
            <span className="font-medium text-foreground">{pagination.page}</span> จาก{' '}
            <span className="font-medium text-foreground">{pagination.totalPages || 1}</span>)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || loading}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="h-8 gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              ก่อนหน้า
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="h-8 gap-1"
            >
              ถัดไป
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
