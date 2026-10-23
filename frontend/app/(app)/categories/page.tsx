'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Category } from '@/types';
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
  Tags,
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  FolderOpen,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const { isAdmin } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Form states
  const [form, setForm] = useState({
    name: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Open Add
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setForm({ name: '', description: '' });
    setCategoryModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setForm({
      name: c.name,
      description: c.description || '',
    });
    setCategoryModalOpen(true);
  };

  // Submit Save
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('กรุณาระบุชื่อหมวดหมู่');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, form);
        toast.success('แก้ไขหมวดหมู่สำเร็จ');
      } else {
        await api.post('/categories', form);
        toast.success('เพิ่มหมวดหมู่สำเร็จ');
      }
      setCategoryModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกหมวดหมู่');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    setSubmitting(true);
    try {
      await api.delete(`/categories/${deletingCategory.id}`);
      toast.success('ลบหมวดหมู่สำเร็จ');
      setDeleteModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ไม่สามารถลบหมวดหมู่ได้');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const totalProducts = categories.reduce((sum, c) => sum + (c._count?.products || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">จัดการหมวดหมู่สินค้า</h1>
          <p className="text-muted-foreground">จัดกลุ่มประเภทสินค้าเพื่อความสะดวกในการจัดการสต๊อก</p>
        </div>
        {isAdmin && (
          <Button onClick={handleOpenAdd} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            เพิ่มหมวดหมู่ใหม่
          </Button>
        )}
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-xs transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Tags className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">หมวดหมู่ทั้งหมด</p>
              <p className="text-xl font-bold">{categories.length} หมวด</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xs transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">รวมสินค้าทุกหมวดหมู่</p>
              <p className="text-xl font-bold">{totalProducts} รายการ</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xs transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">หมวดหมู่ที่มีสินค้า</p>
              <p className="text-xl font-bold">
                {categories.filter((c) => (c._count?.products || 0) > 0).length} หมวด
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อหมวดหมู่ หรือรายละเอียด..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>ชื่อหมวดหมู่</TableHead>
                <TableHead>รายละเอียด</TableHead>
                <TableHead className="text-center">จำนวนสินค้า</TableHead>
                <TableHead>วันที่สร้าง</TableHead>
                {isAdmin && <TableHead className="text-center w-28">การจัดการ</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} className="h-36 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
                      <span className="text-xs text-muted-foreground">กำลังโหลดข้อมูล...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} className="h-36 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Tags className="h-8 w-8 text-muted-foreground/50" />
                      <span>ไม่พบข้อมูลหมวดหมู่</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((c) => (
                  <TableRow key={c.id} className="hover:bg-muted/40">
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {c.name.charAt(0)}
                        </div>
                        <span>{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-xs">
                      {c.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono">
                        {c._count?.products || 0} รายการ
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(c.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            title="แก้ไขหมวดหมู่"
                            onClick={() => handleOpenEdit(c)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            title="ลบหมวดหมู่"
                            onClick={() => {
                              setDeletingCategory(c);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal: Add/Edit Category */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
            </DialogTitle>
            <DialogDescription>
              กำหนดชื่อและคำอธิบายหมวดหมู่สินค้า
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="catName">ชื่อหมวดหมู่ *</Label>
              <Input
                id="catName"
                placeholder="เช่น เครื่องดื่ม, ของใช้ทั่วไป"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catDesc">รายละเอียด / คำอธิบาย</Label>
              <Input
                id="catDesc"
                placeholder="คำอธิบายสั้นๆ ของหมวดหมู่"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryModalOpen(false)}
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

      {/* Modal: Delete Category */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              ยืนยันการลบหมวดหมู่
            </DialogTitle>
            <DialogDescription>
              คุณต้องการลบหมวดหมู่ &quot;{deletingCategory?.name}&quot; หรือไม่?
              {(deletingCategory?._count?.products || 0) > 0 && (
                <span className="block mt-2 font-medium text-amber-600">
                  ⚠️ คำเตือน: มีสินค้าอยู่ในหมวดหมู่นี้จำนวน {deletingCategory?._count?.products} รายการ หากลบหมวดหมู่ สินค้าในหมวดหมู่นี้จะได้รับผลกระทบ
                </span>
              )}
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
              onClick={handleDeleteCategory}
            >
              {submitting ? 'กำลังลบ...' : 'ลบหมวดหมู่'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
