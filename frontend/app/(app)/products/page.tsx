'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Product, Category, PaginatedData, StockMovement } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">จัดการสินค้า</h1>
          <p className="text-muted-foreground">รายการสินค้าและจัดการสต๊อกคงเหลือ</p>
        </div>
        {isAdmin && (
          <Button onClick={handleOpenAdd} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            เพิ่มสินค้าใหม่
          </Button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาตามชื่อสินค้า หรือ SKU..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="pl-9"
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
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="all">สถานะทั้งหมด</option>
                  <option value="in-stock">สต๊อกปกติ</option>
                  <option value="low">ใกล้หมด</option>
                  <option value="out">สินค้าหมด</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('');
                  setSelectedStatus('all');
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="h-9 px-3 gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                รีเซ็ต
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-28">รหัส SKU</TableHead>
                <TableHead>ชื่อสินค้า</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead className="text-right">ราคาขาย</TableHead>
                <TableHead className="text-right">ต้นทุน</TableHead>
                <TableHead className="text-center">คงเหลือ / ขั้นต่ำ</TableHead>
                <TableHead className="text-center">สถานะ</TableHead>
                <TableHead className="text-center w-52">จัดการสต๊อก / รายการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-36 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
                      <span className="text-xs text-muted-foreground">กำลังโหลดข้อมูล...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-36 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground/50" />
                      <span>ไม่พบข้อมูลสินค้า</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => {
                  const isOutOfStock = p.stock === 0;
                  const isLowStock = p.stock > 0 && p.stock <= p.minimumStock;

                  return (
                    <TableRow key={p.id} className="hover:bg-muted/40">
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        {p.sku}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{p.name}</div>
                        {p.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {p.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                          {p.category?.name || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(p.price)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs">
                        {formatCurrency(p.cost)}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        <span className={isOutOfStock ? 'text-destructive' : isLowStock ? 'text-amber-600' : 'text-foreground'}>
                          {formatNumber(p.stock)}
                        </span>{' '}
                        <span className="text-xs text-muted-foreground font-normal">
                          / {formatNumber(p.minimumStock)} {p.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {isOutOfStock ? (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            หมด
                          </Badge>
                        ) : isLowStock ? (
                          <Badge className="bg-amber-500 hover:bg-amber-600 gap-1 text-white">
                            <AlertTriangle className="h-3 w-3" />
                            ใกล้หมด
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            ปกติ
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Stock In */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title="รับสินค้าเข้าสต๊อก"
                            onClick={() => handleOpenStockAction(p, 'IN')}
                          >
                            <ArrowUpCircle className="h-4 w-4" />
                          </Button>

                          {/* Stock Out */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            title="เบิกสินค้าออกจากสต๊อก"
                            disabled={p.stock <= 0}
                            onClick={() => handleOpenStockAction(p, 'OUT')}
                          >
                            <ArrowDownCircle className="h-4 w-4" />
                          </Button>

                          {/* Adjust (Admin only) */}
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                              title="ปรับปรุงยอดสต๊อก"
                              onClick={() => handleOpenStockAction(p, 'ADJUSTMENT')}
                            >
                              <SlidersHorizontal className="h-4 w-4" />
                            </Button>
                          )}

                          {/* View details */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            title="ดูรายละเอียดและประวัติ"
                            onClick={() => handleOpenDetail(p)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Edit (Admin) */}
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              title="แก้ไขสินค้า"
                              onClick={() => handleOpenEdit(p)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Delete (Admin) */}
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                              title="ลบสินค้า"
                              onClick={() => {
                                setDeletingProduct(p);
                                setDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

      {/* Modal 1: Add/Edit Product */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}
            </DialogTitle>
            <DialogDescription>
              กรอกข้อมูลรายละเอียดสินค้าให้ครบถ้วน
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProduct} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sku">รหัสสินค้า (SKU) *</Label>
                <Input
                  id="sku"
                  placeholder="เช่น PRD-001"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  disabled={!!editingProduct}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="categoryId">หมวดหมู่ *</Label>
                <select
                  id="categoryId"
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              <Label htmlFor="name">ชื่อสินค้า *</Label>
              <Input
                id="name"
                placeholder="ระบุชื่อสินค้า"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
              <Input
                id="description"
                placeholder="รายละเอียด ขนาด คุณสมบัติ"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">ราคาขาย (บาท) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cost">ต้นทุน (บาท) *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.cost}
                  onChange={(e) => setProductForm({ ...productForm, cost: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {!editingProduct && (
                <div className="space-y-1.5">
                  <Label htmlFor="stock">สต๊อกเริ่มต้น</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="minimumStock">จุดเตือนขั้นต่ำ</Label>
                <Input
                  id="minimumStock"
                  type="number"
                  min="0"
                  value={productForm.minimumStock}
                  onChange={(e) => setProductForm({ ...productForm, minimumStock: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit">หน่วยนับ</Label>
                <Input
                  id="unit"
                  placeholder="เช่น ชิ้น, กล่อง"
                  value={productForm.unit}
                  onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setProductModalOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Quick Stock Transaction (In / Out / Adjust) */}
      <Dialog open={stockModalOpen} onOpenChange={setStockModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {stockActionType === 'IN' && (
                <>
                  <ArrowUpCircle className="h-5 w-5 text-emerald-600" />
                  <span>รับสินค้าเข้าสต๊อก (Stock In)</span>
                </>
              )}
              {stockActionType === 'OUT' && (
                <>
                  <ArrowDownCircle className="h-5 w-5 text-rose-600" />
                  <span>เบิกสินค้าออกจากสต๊อก (Stock Out)</span>
                </>
              )}
              {stockActionType === 'ADJUSTMENT' && (
                <>
                  <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
                  <span>ปรับยอดคงเหลือสต๊อก (Stock Adjust)</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct?.name} ({selectedProduct?.sku})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleStockActionSubmit} className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-muted/60 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">สต๊อกปัจจุบัน:</span>
                <span className="font-semibold text-foreground">
                  {selectedProduct?.stock} {selectedProduct?.unit}
                </span>
              </div>
              {stockActionType === 'IN' && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>ยอดหลังรับเข้า:</span>
                  <span>
                    {(selectedProduct?.stock || 0) + Number(stockForm.quantity)}{' '}
                    {selectedProduct?.unit}
                  </span>
                </div>
              )}
              {stockActionType === 'OUT' && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>ยอดหลังเบิกออก:</span>
                  <span>
                    {Math.max(0, (selectedProduct?.stock || 0) - Number(stockForm.quantity))}{' '}
                    {selectedProduct?.unit}
                  </span>
                </div>
              )}
              {stockActionType === 'ADJUSTMENT' && (
                <div className="flex justify-between text-indigo-600 font-medium">
                  <span>ยอดใหม่หลังปรับ:</span>
                  <span>
                    {Number(stockForm.quantity)} {selectedProduct?.unit}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stockQty">
                {stockActionType === 'ADJUSTMENT' ? 'ระบุยอดสต๊อกใหม่ที่ถูกต้อง *' : 'จำนวน *'}
              </Label>
              <Input
                id="stockQty"
                type="number"
                min={stockActionType === 'ADJUSTMENT' ? 0 : 1}
                max={stockActionType === 'OUT' ? selectedProduct?.stock : undefined}
                value={stockForm.quantity}
                onChange={(e) => setStockForm({ ...stockForm, quantity: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stockNote">หมายเหตุ / เหตุผล</Label>
              <Input
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
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStockModalOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className={
                  stockActionType === 'IN'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : stockActionType === 'OUT'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : ''
                }
              >
                {submitting ? 'กำลังบันทึก...' : 'ยืนยันทำรายการ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Product Detail & Recent History */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span>รายละเอียดสินค้า</span>
            </DialogTitle>
            <DialogDescription>
              รหัส SKU: {detailProduct?.sku}
            </DialogDescription>
          </DialogHeader>

          {detailProduct && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/40">
                  <span className="text-xs text-muted-foreground">หมวดหมู่</span>
                  <p className="font-semibold">{detailProduct.category?.name || '-'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <span className="text-xs text-muted-foreground">คงเหลือปัจจุบัน</span>
                  <p className="font-semibold text-primary">
                    {formatNumber(detailProduct.stock)} {detailProduct.unit}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <span className="text-xs text-muted-foreground">ราคาขาย</span>
                  <p className="font-semibold">{formatCurrency(detailProduct.price)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <span className="text-xs text-muted-foreground">ต้นทุน</span>
                  <p className="font-semibold text-muted-foreground">{formatCurrency(detailProduct.cost)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  ประวัติการเคลื่อนไหวสต๊อกล่าสุด
                </h4>

                {detailLoading ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    กำลังโหลดประวัติ...
                  </div>
                ) : detailMovements.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground border rounded-lg">
                    ยังไม่มีประวัติการเคลื่อนไหว
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/40 text-xs">
                        <TableRow>
                          <TableHead>วัน-เวลา</TableHead>
                          <TableHead>ประเภท</TableHead>
                          <TableHead className="text-right">จำนวน</TableHead>
                          <TableHead className="text-right">ยอดก่อนหน้า/ใหม่</TableHead>
                          <TableHead>ผู้บันทึก</TableHead>
                          <TableHead>หมายเหตุ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="text-xs">
                        {detailMovements.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {new Date(m.createdAt).toLocaleString('th-TH', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </TableCell>
                            <TableCell>
                              {m.type === 'IN' && (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-[10px] px-1.5 py-0 border-emerald-200">
                                  รับเข้า
                                </Badge>
                              )}
                              {m.type === 'OUT' && (
                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                  เบิกออก
                                </Badge>
                              )}
                              {m.type === 'ADJUSTMENT' && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  ปรับปรุง
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {m.type === 'IN' ? `+${m.quantity}` : m.type === 'OUT' ? `-${m.quantity}` : m.quantity}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {m.previousStock} → {m.newStock}
                            </TableCell>
                            <TableCell>{m.user?.name || '-'}</TableCell>
                            <TableCell className="max-w-[150px] truncate text-muted-foreground">
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
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 4: Delete Confirmation */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              ยืนยันการลบสินค้า
            </DialogTitle>
            <DialogDescription>
              คุณต้องการลบสินค้า &quot;{deletingProduct?.name}&quot; ({deletingProduct?.sku}) หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              disabled={submitting}
              onClick={handleDeleteProduct}
            >
              {submitting ? 'กำลังลบ...' : 'ลบสินค้า'}
            </Button>
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
