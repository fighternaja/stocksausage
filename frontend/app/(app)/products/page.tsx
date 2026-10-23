'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Product, Category, PaginatedData, StockMovement } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Package,
  Plus,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

function ProductsContent() {
  const { isAdmin } = useAuth();
  const searchParams = useSearchParams();

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'low' | 'out' | 'in-stock'>('all');

  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockActionType, setStockActionType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [detailMovements, setDetailMovements] = useState<StockMovement[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    sku: '',
    name: '',
    description: '',
    categoryId: '',
    price: 0,
    cost: 0,
    stock: 0,
    minimumStock: 5,
    unit: 'ชิ้น',
  });

  const [stockForm, setStockForm] = useState({
    quantity: 1,
    note: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch {
      toast.error('ไม่สามารถโหลดหมวดหมู่ได้');
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const res = await api.get(`/products?${params.toString()}`);
      const data: PaginatedData<Product> = res.data.data;
      setProducts(data.items || []);
      setPagination((prev) => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages,
      }));
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลสินค้าได้');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync with URL query parameters
  useEffect(() => {
    const statusParam = searchParams.get('status') as 'all' | 'low' | 'out' | 'in-stock';
    if (statusParam && ['all', 'low', 'out', 'in-stock'].includes(statusParam)) {
      setSelectedStatus(statusParam);
    }
    const searchParam = searchParams.get('search');
    if (searchParam !== null) {
      setSearch(searchParam);
    }
  }, [searchParams]);

  // Handle action parameter (e.g. stock-in from dashboard)
  useEffect(() => {
    const action = searchParams.get('action');
    const productId = searchParams.get('productId');
    if (action === 'stock-in' && productId && products.length > 0) {
      const target = products.find((p) => p.id === productId);
      if (target) {
        handleOpenStockAction(target, 'IN');
      }
    }
  }, [searchParams, products]);

  // Open Add Product
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductForm({
      sku: '',
      name: '',
      description: '',
      categoryId: categories[0]?.id || '',
      price: 0,
      cost: 0,
      stock: 0,
      minimumStock: 5,
      unit: 'ชิ้น',
    });
    setProductModalOpen(true);
  };

  // Open Edit Product
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      sku: p.sku,
      name: p.name,
      description: p.description || '',
      categoryId: p.categoryId,
      price: p.price,
      cost: p.cost,
      stock: p.stock,
      minimumStock: p.minimumStock,
      unit: p.unit || 'ชิ้น',
    });
    setProductModalOpen(true);
  };

  // Save Product (Create / Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.sku.trim() || !productForm.name.trim() || !productForm.categoryId) {
      toast.error('กรุณากรอกรหัสสินค้า, ชื่อสินค้า และเลือกหมวดหมู่');
      return;
    }
    setSubmitting(true);
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, {
          name: productForm.name,
          description: productForm.description,
          categoryId: productForm.categoryId,
          price: Number(productForm.price),
          cost: Number(productForm.cost),
          minimumStock: Number(productForm.minimumStock),
          unit: productForm.unit,
        });
        toast.success('แก้ไขสินค้าสำเร็จ');
      } else {
        await api.post('/products', {
          ...productForm,
          price: Number(productForm.price),
          cost: Number(productForm.cost),
          stock: Number(productForm.stock),
          minimumStock: Number(productForm.minimumStock),
        });
        toast.success('เพิ่มสินค้าสำเร็จ');
      }
      setProductModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกสินค้า');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Stock Action Modal
  const handleOpenStockAction = (product: Product, type: 'IN' | 'OUT' | 'ADJUSTMENT') => {
    setSelectedProduct(product);
    setStockActionType(type);
    setStockForm({
      quantity: type === 'ADJUSTMENT' ? product.stock : 1,
      note: '',
    });
    setStockModalOpen(true);
  };

  // Handle Stock Action Submit
  const handleStockActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (stockForm.quantity < 0) {
      toast.error('จำนวนต้องไม่ติดลบ');
      return;
    }

    setSubmitting(true);
    try {
      let endpoint = '/stock/in';
      if (stockActionType === 'OUT') endpoint = '/stock/out';
      if (stockActionType === 'ADJUSTMENT') endpoint = '/stock/adjust';

      await api.post(endpoint, {
        productId: selectedProduct.id,
        quantity: Number(stockForm.quantity),
        note: stockForm.note.trim() || undefined,
      });

      toast.success(
        stockActionType === 'IN'
          ? 'รับสินค้าเข้าสต๊อกสำเร็จ'
          : stockActionType === 'OUT'
          ? 'เบิกสินค้าออกจากสต๊อกสำเร็จ'
          : 'ปรับยอดสต๊อกสำเร็จ'
      );
      setStockModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ทำรายการสต๊อกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Detail & History Modal
  const handleOpenDetail = async (product: Product) => {
    setDetailProduct(product);
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await api.get(`/stock/movements/${product.id}?limit=10`);
      setDetailMovements(res.data.data?.items || []);
    } catch {
      toast.error('ไม่สามารถโหลดประวัติการเคลื่อนไหวสต๊อกได้');
    } finally {
      setDetailLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setSubmitting(true);
    try {
      await api.delete(`/products/${deletingProduct.id}`);
      toast.success('ลบสินค้าสำเร็จ');
      setDeleteModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ไม่สามารถลบสินค้าได้');
    } finally {
      setSubmitting(false);
    }
  };

  const formatNumber = (n: number) => new Intl.NumberFormat('th-TH').format(n);
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(n);

  const selectClass =
    'flex h-9 w-full rounded-xl border border-blue-500/25 bg-[#0a101f]/90 px-3 py-1 text-sm text-slate-200 shadow-xs transition-colors focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20';

  const inputClass =
    'w-full px-3 py-2 rounded-xl bg-[#0a101f]/90 border border-blue-500/25 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-[#0e162b]/85 border border-blue-500/15 backdrop-blur-xl shadow-lg">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>จัดการสินค้า</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">รายการสินค้าและจัดการสต๊อกคงเหลือ</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 shadow-[0_0_20px_rgba(0,212,255,0.45)] hover:shadow-[0_0_30px_rgba(0,212,255,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-950" />
            <span>เพิ่มสินค้าใหม่</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหาตามชื่อสินค้า หรือ SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0a101f]/90 border border-blue-500/25 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="w-40 sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={selectClass}
              >
                <option value="">ทุกหมวดหมู่</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-36">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as any);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={selectClass}
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="in-stock">สต๊อกปกติ</option>
                <option value="low">ใกล้หมด</option>
                <option value="out">สินค้าหมด</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setSelectedStatus('all');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="h-9 px-4 rounded-xl flex items-center gap-1.5 text-sm text-slate-400 border border-blue-900/40 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              รีเซ็ต
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-blue-900/40 bg-[#0a101f]/90 hover:bg-[#0a101f]/90">
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono py-3 w-28">รหัส SKU</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono py-3">ชื่อสินค้า</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono py-3">หมวดหมู่</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono text-right py-3">ราคาขาย</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono text-right py-3">ต้นทุน</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono text-center py-3">คงเหลือ / ขั้นต่ำ</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono text-center py-3">สถานะ</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono text-center w-52 py-3">จัดการสต๊อก</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-36 text-center border-b border-blue-900/20">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-cyan-400 border-t-transparent shadow-[0_0_15px_#00e5ff]" />
                      <span className="text-xs font-mono text-cyan-400 tracking-wider">LOADING DATA...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-36 text-center border-b border-blue-900/20">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="h-8 w-8 text-slate-600" />
                      <span className="text-sm text-slate-500">ไม่พบข้อมูลสินค้า</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => {
                  const isOutOfStock = p.stock === 0;
                  const isLowStock = p.stock > 0 && p.stock <= p.minimumStock;

                  return (
                    <TableRow key={p.id} className="border-b border-blue-900/20 hover:bg-blue-500/5 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-cyan-300 py-3">
                        {p.sku}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="font-medium text-slate-200">{p.name}</div>
                        {p.description && (
                          <div className="text-xs text-slate-500 line-clamp-1">{p.description}</div>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/20">
                          {p.category?.name || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-200 py-3">
                        {formatCurrency(p.price)}
                      </TableCell>
                      <TableCell className="text-right text-slate-500 text-xs font-mono py-3">
                        {formatCurrency(p.cost)}
                      </TableCell>
                      <TableCell className="text-center font-semibold font-mono py-3">
                        <span className={isOutOfStock ? 'text-rose-400' : isLowStock ? 'text-amber-400' : 'text-slate-200'}>
                          {formatNumber(p.stock)}
                        </span>{' '}
                        <span className="text-xs text-slate-600 font-normal">
                          / {formatNumber(p.minimumStock)} {p.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <XCircle className="h-3 w-3" />
                            หมด
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <AlertTriangle className="h-3 w-3" />
                            ใกล้หมด
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" />
                            ปกติ
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <div className="flex items-center justify-center gap-1">
                          {/* Stock In */}
                          <button
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-emerald-500 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all"
                            title="รับสินค้าเข้าสต๊อก"
                            onClick={() => handleOpenStockAction(p, 'IN')}
                          >
                            <ArrowUpCircle className="h-4 w-4" />
                          </button>

                          {/* Stock Out */}
                          <button
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-rose-500 hover:text-rose-300 hover:bg-rose-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            title="เบิกสินค้าออกจากสต๊อก"
                            disabled={p.stock <= 0}
                            onClick={() => handleOpenStockAction(p, 'OUT')}
                          >
                            <ArrowDownCircle className="h-4 w-4" />
                          </button>

                          {/* Adjust (Admin only) */}
                          {isAdmin && (
                            <button
                              className="h-8 w-8 flex items-center justify-center rounded-lg text-indigo-500 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                              title="ปรับปรุงยอดสต๊อก"
                              onClick={() => handleOpenStockAction(p, 'ADJUSTMENT')}
                            >
                              <SlidersHorizontal className="h-4 w-4" />
                            </button>
                          )}

                          {/* View details */}
                          <button
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all"
                            title="ดูรายละเอียดและประวัติ"
                            onClick={() => handleOpenDetail(p)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Edit (Admin) */}
                          {isAdmin && (
                            <button
                              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all"
                              title="แก้ไขสินค้า"
                              onClick={() => handleOpenEdit(p)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}

                          {/* Delete (Admin) */}
                          {isAdmin && (
                            <button
                              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="ลบสินค้า"
                              onClick={() => {
                                setDeletingProduct(p);
                                setDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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

      {/* Modal 1: Add/Edit Product */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-[#0d1527] border border-blue-900/50 text-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              กรอกข้อมูลรายละเอียดสินค้าให้ครบถ้วน
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProduct} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sku" className="text-slate-300">รหัสสินค้า (SKU) *</Label>
                <input
                  id="sku"
                  placeholder="เช่น PRD-001"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  disabled={!!editingProduct}
                  required
                  className={`${inputClass} ${editingProduct ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="categoryId" className="text-slate-300">หมวดหมู่ *</Label>
                <select
                  id="categoryId"
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  className={selectClass}
                  required
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-slate-300">ชื่อสินค้า *</Label>
              <input
                id="name"
                placeholder="ระบุชื่อสินค้า"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-slate-300">รายละเอียดเพิ่มเติม</Label>
              <input
                id="description"
                placeholder="รายละเอียด ขนาด คุณสมบัติ"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-slate-300">ราคาขาย (บาท) *</Label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  required
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cost" className="text-slate-300">ต้นทุน (บาท) *</Label>
                <input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.cost}
                  onChange={(e) => setProductForm({ ...productForm, cost: Number(e.target.value) })}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {!editingProduct && (
                <div className="space-y-1.5">
                  <Label htmlFor="stock" className="text-slate-300">สต๊อกเริ่มต้น</Label>
                  <input
                    id="stock"
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="minimumStock" className="text-slate-300">จุดเตือนขั้นต่ำ</Label>
                <input
                  id="minimumStock"
                  type="number"
                  min="0"
                  value={productForm.minimumStock}
                  onChange={(e) => setProductForm({ ...productForm, minimumStock: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit" className="text-slate-300">หน่วยนับ</Label>
                <input
                  id="unit"
                  placeholder="เช่น ชิ้น, กล่อง"
                  value={productForm.unit}
                  onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setProductModalOpen(false)}
                className="border-blue-900/50 text-slate-300 hover:bg-blue-900/30 hover:text-white"
              >
                ยกเลิก
              </Button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(0,212,255,0.35)] hover:shadow-[0_0_25px_rgba(0,212,255,0.55)] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Quick Stock Transaction (In / Out / Adjust) */}
      <Dialog open={stockModalOpen} onOpenChange={setStockModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#0d1527] border border-blue-900/50 text-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              {stockActionType === 'IN' && (
                <>
                  <ArrowUpCircle className="h-5 w-5 text-emerald-400" />
                  <span>รับสินค้าเข้าสต๊อก (Stock In)</span>
                </>
              )}
              {stockActionType === 'OUT' && (
                <>
                  <ArrowDownCircle className="h-5 w-5 text-rose-400" />
                  <span>เบิกสินค้าออกจากสต๊อก (Stock Out)</span>
                </>
              )}
              {stockActionType === 'ADJUSTMENT' && (
                <>
                  <SlidersHorizontal className="h-5 w-5 text-indigo-400" />
                  <span>ปรับยอดคงเหลือสต๊อก (Stock Adjust)</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedProduct?.name} ({selectedProduct?.sku})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleStockActionSubmit} className="space-y-4 py-2">
            <div className="p-3 rounded-xl bg-[#0a101f]/90 border border-blue-500/20 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">สต๊อกปัจจุบัน:</span>
                <span className="font-semibold font-mono text-slate-200">
                  {selectedProduct?.stock} {selectedProduct?.unit}
                </span>
              </div>
              {stockActionType === 'IN' && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>ยอดหลังรับเข้า:</span>
                  <span className="font-mono">
                    {(selectedProduct?.stock || 0) + Number(stockForm.quantity)}{' '}
                    {selectedProduct?.unit}
                  </span>
                </div>
              )}
              {stockActionType === 'OUT' && (
                <div className="flex justify-between text-rose-400 font-medium">
                  <span>ยอดหลังเบิกออก:</span>
                  <span className="font-mono">
                    {Math.max(0, (selectedProduct?.stock || 0) - Number(stockForm.quantity))}{' '}
                    {selectedProduct?.unit}
                  </span>
                </div>
              )}
              {stockActionType === 'ADJUSTMENT' && (
                <div className="flex justify-between text-indigo-400 font-medium">
                  <span>ยอดใหม่หลังปรับ:</span>
                  <span className="font-mono">
                    {Number(stockForm.quantity)} {selectedProduct?.unit}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stockQty" className="text-slate-300">
                {stockActionType === 'ADJUSTMENT' ? 'ระบุยอดสต๊อกใหม่ที่ถูกต้อง *' : 'จำนวน *'}
              </Label>
              <input
                id="stockQty"
                type="number"
                min={stockActionType === 'ADJUSTMENT' ? 0 : 1}
                max={stockActionType === 'OUT' ? selectedProduct?.stock : undefined}
                value={stockForm.quantity}
                onChange={(e) => setStockForm({ ...stockForm, quantity: Number(e.target.value) })}
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stockNote" className="text-slate-300">หมายเหตุ / เหตุผล</Label>
              <input
                id="stockNote"
                placeholder={
                  stockActionType === 'IN'
                    ? 'เช่น รับสินค้าจากซัพพลายเออร์ล็อต 12'
                    : stockActionType === 'OUT'
                    ? 'เช่น ขายหน้าร้าน, เบิกใช้ภายใน'
                    : 'เช่น ตรวจนับสต๊อกประจำเดือน, สินค้าเสียหาย'
                }
                value={stockForm.note}
                onChange={(e) => setStockForm({ ...stockForm, note: e.target.value })}
                className={inputClass}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStockModalOpen(false)}
                className="border-blue-900/50 text-slate-300 hover:bg-blue-900/30 hover:text-white"
              >
                ยกเลิก
              </Button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider text-white shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
                  stockActionType === 'IN'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : stockActionType === 'OUT'
                    ? 'bg-gradient-to-r from-rose-600 to-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                }`}
              >
                {submitting ? 'กำลังบันทึก...' : 'ยืนยันทำรายการ'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Product Detail & Recent History */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-[#0d1527] border border-blue-900/50 text-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Package className="h-5 w-5 text-cyan-400" />
              <span>รายละเอียดสินค้า</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-mono">
              รหัส SKU: {detailProduct?.sku}
            </DialogDescription>
          </DialogHeader>

          {detailProduct && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#0a101f]/90 border border-blue-500/20">
                  <span className="text-xs text-slate-500">หมวดหมู่</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{detailProduct.category?.name || '-'}</p>
                </div>
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <span className="text-xs text-slate-500">คงเหลือปัจจุบัน</span>
                  <p className="font-bold text-cyan-300 font-mono mt-0.5">
                    {formatNumber(detailProduct.stock)} {detailProduct.unit}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#0a101f]/90 border border-blue-500/20">
                  <span className="text-xs text-slate-500">ราคาขาย</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{formatCurrency(detailProduct.price)}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0a101f]/90 border border-blue-500/20">
                  <span className="text-xs text-slate-500">ต้นทุน</span>
                  <p className="font-semibold text-slate-400 mt-0.5">{formatCurrency(detailProduct.cost)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-slate-300">
                  <Clock className="h-4 w-4 text-slate-500" />
                  ประวัติการเคลื่อนไหวสต๊อกล่าสุด
                </h4>

                {detailLoading ? (
                  <div className="py-8 text-center text-xs text-cyan-400 font-mono">
                    กำลังโหลดประวัติ...
                  </div>
                ) : detailMovements.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 border border-blue-900/30 rounded-xl bg-[#0a101f]/50">
                    ยังไม่มีประวัติการเคลื่อนไหว
                  </div>
                ) : (
                  <div className="rounded-xl overflow-x-auto border border-blue-900/30 bg-[#0a101f]/50">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-blue-900/40 bg-[#0a101f]/90 hover:bg-[#0a101f]/90">
                          <TableHead className="text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono py-2">วัน-เวลา</TableHead>
                          <TableHead className="text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono py-2">ประเภท</TableHead>
                          <TableHead className="text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono text-right py-2">จำนวน</TableHead>
                          <TableHead className="text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono text-right py-2">ก่อน/ใหม่</TableHead>
                          <TableHead className="text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono py-2">ผู้บันทึก</TableHead>
                          <TableHead className="text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono py-2">หมายเหตุ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="text-xs">
                        {detailMovements.map((m) => (
                          <TableRow key={m.id} className="border-b border-blue-900/20 hover:bg-blue-500/5">
                            <TableCell className="whitespace-nowrap text-slate-500 font-mono py-2">
                              {new Date(m.createdAt).toLocaleString('th-TH', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </TableCell>
                            <TableCell className="py-2">
                              {m.type === 'IN' && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  รับเข้า
                                </span>
                              )}
                              {m.type === 'OUT' && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  เบิกออก
                                </span>
                              )}
                              {m.type === 'ADJUSTMENT' && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  ปรับปรุง
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-semibold font-mono py-2">
                              {m.type === 'IN' ? `+${m.quantity}` : m.type === 'OUT' ? `-${m.quantity}` : m.quantity}
                            </TableCell>
                            <TableCell className="text-right font-mono text-slate-500 py-2">
                              {m.previousStock} → <span className="text-cyan-300">{m.newStock}</span>
                            </TableCell>
                            <TableCell className="text-slate-300 py-2">{m.user?.name || '-'}</TableCell>
                            <TableCell className="max-w-[150px] truncate text-slate-500 py-2">
                              {m.note || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailModalOpen(false)}
              className="border-blue-900/50 text-slate-300 hover:bg-blue-900/30 hover:text-white"
            >
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 4: Delete Confirmation */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-sm bg-[#0d1527] border border-blue-900/50 text-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              ยืนยันการลบสินค้า
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              คุณต้องการลบสินค้า &quot;{deletingProduct?.name}&quot; ({deletingProduct?.sku}) หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="border-blue-900/50 text-slate-300 hover:bg-blue-900/30 hover:text-white"
            >
              ยกเลิก
            </Button>
            <button
              disabled={submitting}
              onClick={handleDeleteProduct}
              className="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'กำลังลบ...' : 'ลบสินค้า'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-9 w-9 border-2 border-cyan-400 border-t-transparent shadow-[0_0_20px_#00e5ff]" />
            <span className="text-xs font-mono text-cyan-400 tracking-wider">LOADING...</span>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
