'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Category } from '@/types';
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
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก');
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

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalProducts = categories.reduce((sum, c) => sum + (c._count?.products || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-[#0e162b]/85 border border-blue-500/15 backdrop-blur-xl shadow-lg">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>จัดการหมวดหมู่สินค้า</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            จัดกลุ่มประเภทสินค้าเพื่อความสะดวกในการจัดการสต๊อก
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 shadow-[0_0_20px_rgba(0,212,255,0.45)] hover:shadow-[0_0_30px_rgba(0,212,255,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-950" />
            <span>เพิ่มหมวดหมู่ใหม่</span>
          </button>
        )}
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/35 transition-all shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.2)]">
              <Tags className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">หมวดหมู่ทั้งหมด</p>
              <p className="text-2xl font-extrabold text-white font-mono">{categories.length} <span className="text-xs text-slate-400 font-normal">หมวด</span></p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/35 transition-all shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">รวมสินค้าทุกหมวด</p>
              <p className="text-2xl font-extrabold text-white font-mono">{totalProducts} <span className="text-xs text-slate-400 font-normal">รายการ</span></p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/35 transition-all shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-400">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">หมวดที่มีสินค้า</p>
              <p className="text-2xl font-extrabold text-white font-mono">
                {categories.filter((c) => (c._count?.products || 0) > 0).length} <span className="text-xs text-slate-400 font-normal">หมวด</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="ค้นหาชื่อหมวดหมู่ หรือรายละเอียด..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0a101f]/90 border border-blue-500/25 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-blue-900/40 bg-[#0a101f]/90 hover:bg-[#0a101f]/90">
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono py-3">ชื่อหมวดหมู่</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono py-3">รายละเอียด</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono text-center py-3">จำนวนสินค้า</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono py-3">วันที่สร้าง</TableHead>
                {isAdmin && <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono text-center w-28 py-3">การจัดการ</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} className="h-36 text-center border-b border-blue-900/20">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-cyan-400 border-t-transparent shadow-[0_0_15px_#00e5ff]" />
                      <span className="text-xs font-mono text-cyan-400 tracking-wider">LOADING DATA...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} className="h-36 text-center border-b border-blue-900/20">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Tags className="h-8 w-8 text-slate-600" />
                      <span className="text-sm text-slate-500">ไม่พบข้อมูลหมวดหมู่</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((c) => (
                  <TableRow key={c.id} className="border-b border-blue-900/20 hover:bg-blue-500/5 transition-colors">
                    <TableCell className="font-semibold text-slate-200 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center text-xs font-bold">
                          {c.name.charAt(0)}
                        </div>
                        <span>{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm max-w-xs">
                      {c.description || <span className="text-slate-600">-</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-cyan-300 border border-cyan-500/30">
                        {c._count?.products || 0} รายการ
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs font-mono">
                      {new Date(c.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all"
                            title="แก้ไขหมวดหมู่"
                            onClick={() => handleOpenEdit(c)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="ลบหมวดหมู่"
                            onClick={() => {
                              setDeletingCategory(c);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal: Add/Edit Category */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#0d1527] border border-blue-900/50 text-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              กำหนดชื่อและคำอธิบายหมวดหมู่สินค้า
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="catName" className="text-slate-300">ชื่อหมวดหมู่ *</Label>
              <input
                id="catName"
                placeholder="เช่น เครื่องดื่ม, ของใช้ทั่วไป"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#0a101f]/90 border border-blue-500/25 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catDesc" className="text-slate-300">รายละเอียด / คำอธิบาย</Label>
              <input
                id="catDesc"
                placeholder="คำอธิบายสั้นๆ ของหมวดหมู่"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#0a101f]/90 border border-blue-500/25 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryModalOpen(false)}
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

      {/* Modal: Delete Category */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-sm bg-[#0d1527] border border-blue-900/50 text-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              ยืนยันการลบหมวดหมู่
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              คุณต้องการลบหมวดหมู่ &quot;{deletingCategory?.name}&quot; หรือไม่?
              {(deletingCategory?._count?.products || 0) > 0 && (
                <span className="block mt-2 font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  ⚠️ คำเตือน: มีสินค้าอยู่ในหมวดหมู่นี้จำนวน {deletingCategory?._count?.products} รายการ
                </span>
              )}
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
              onClick={handleDeleteCategory}
              className="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'กำลังลบ...' : 'ลบหมวดหมู่'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
