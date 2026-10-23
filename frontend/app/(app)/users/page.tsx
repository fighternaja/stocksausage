'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { User } from '@/types';
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
  Users,
  Plus,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  Search,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

export default function UsersPage() {
  const { user: currentUser, isAdmin } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF' as 'ADMIN' | 'STAFF',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    role: 'STAFF' as 'ADMIN' | 'STAFF',
    status: 'ACTIVE' as 'ACTIVE' | 'DISABLED',
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [isAdmin, fetchUsers]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-white">ไม่มีสิทธิ์เข้าถึงหน้านี้</h2>
        <p className="text-slate-400 max-w-md text-sm">
          หน้านี้สงวนไว้สำหรับผู้ดูแลระบบ (ADMIN) เท่านั้น กรุณาติดต่อผู้ดูแลระบบหากต้องการสิทธิ์เพิ่มเติม
        </p>
      </div>
    );
  }

  // Handle Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/users', addForm);
      toast.success('เพิ่มผู้ใช้สำเร็จ');
      setAddModalOpen(false);
      setAddForm({ name: '', email: '', password: '', role: 'STAFF' });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ไม่สามารถเพิ่มผู้ใช้ได้');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit
  const handleOpenEdit = (u: User) => {
    setSelectedUser(u);
    setEditForm({
      name: u.name,
      role: u.role,
      status: u.status,
    });
    setEditModalOpen(true);
  };

  // Handle Edit User
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      await api.put(`/users/${selectedUser.id}`, editForm);
      toast.success('แก้ไขข้อมูลผู้ใช้สำเร็จ');
      setEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ไม่สามารถแก้ไขข้อมูลผู้ใช้ได้');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (selectedUser.id === currentUser?.id) {
      toast.error('ไม่สามารถลบบัญชีของตัวเองได้');
      return;
    }

    setSubmitting(true);
    try {
      await api.delete(`/users/${selectedUser.id}`);
      toast.success('ลบผู้ใช้สำเร็จ');
      setDeleteModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ไม่สามารถลบผู้ใช้ได้');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const selectClass =
    'flex h-9 w-full rounded-xl border border-blue-500/25 bg-[#0a101f]/90 px-3 py-1 text-sm text-slate-200 shadow-xs transition-colors focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-[#0e162b]/85 border border-blue-500/15 backdrop-blur-xl shadow-lg">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>จัดการผู้ใช้งานระบบ</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            จัดการบัญชีผู้ใช้ สิทธิ์การเข้าถึง และสถานะการใช้งาน
          </p>
        </div>
        <button
          onClick={() => {
            setAddForm({ name: '', email: '', password: '', role: 'STAFF' });
            setAddModalOpen(true);
          }}
          className="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 shadow-[0_0_20px_rgba(0,212,255,0.45)] hover:shadow-[0_0_30px_rgba(0,212,255,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-slate-950" />
          <span>เพิ่มผู้ใช้ใหม่</span>
        </button>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl hover:border-cyan-500/35 transition-all shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.2)]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">ผู้ใช้ทั้งหมด</p>
              <p className="text-2xl font-extrabold text-white font-mono">{users.length} <span className="text-xs text-slate-400 font-normal">คน</span></p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl hover:border-cyan-500/35 transition-all shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">ADMIN</p>
              <p className="text-2xl font-extrabold text-white font-mono">
                {users.filter((u) => u.role === 'ADMIN').length} <span className="text-xs text-slate-400 font-normal">คน</span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl hover:border-cyan-500/35 transition-all shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">STAFF</p>
              <p className="text-2xl font-extrabold text-white font-mono">
                {users.filter((u) => u.role === 'STAFF').length} <span className="text-xs text-slate-400 font-normal">คน</span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl hover:border-cyan-500/35 transition-all shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">ใช้งานปกติ</p>
              <p className="text-2xl font-extrabold text-white font-mono">
                {users.filter((u) => u.status === 'ACTIVE').length} <span className="text-xs text-slate-400 font-normal">คน</span>
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
            placeholder="ค้นหาชื่อ หรืออีเมล..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0a101f]/90 border border-blue-500/25 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-[#0e162b]/80 border border-blue-500/15 backdrop-blur-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-blue-900/40 bg-[#0a101f]/90 hover:bg-[#0a101f]/90">
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono py-3">ผู้ใช้งาน</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono py-3">อีเมล</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono text-center py-3">บทบาท</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono text-center py-3">สถานะ</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono text-center py-3">จำนวนทำรายการ</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono py-3">วันที่สร้าง</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono text-center w-28 py-3">การจัดการ</TableHead>
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
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center border-b border-blue-900/20">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-slate-600" />
                      <span className="text-sm text-slate-500">ไม่พบข้อมูลผู้ใช้</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} className="border-b border-blue-900/20 hover:bg-blue-500/5 transition-colors">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600/60 to-cyan-500/60 border border-cyan-500/30 text-cyan-300 flex items-center justify-center text-xs font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-200">{u.name}</span>
                          {u.id === currentUser?.id && (
                            <span className="ml-1.5 text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-mono">
                              (คุณ)
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm font-mono py-3">
                      {u.email}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      {u.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          <Shield className="h-3 w-3" />
                          ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-500/25">
                          STAFF
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      {u.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <UserCheck className="h-3 w-3" />
                          เปิดใช้งาน
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <UserX className="h-3 w-3" />
                          ระงับการใช้งาน
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm text-slate-400 py-3">
                      {u._count?.stockMovements || 0} ครั้ง
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs font-mono whitespace-nowrap py-3">
                      {new Date(u.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all"
                          title="แก้ไขผู้ใช้"
                          onClick={() => handleOpenEdit(u)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          title="ลบผู้ใช้"
                          disabled={u.id === currentUser?.id}
                          onClick={() => {
                            setSelectedUser(u);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal: Add User */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#0d1527] border border-blue-900/50 text-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">เพิ่มผู้ใช้งานใหม่</DialogTitle>
            <DialogDescription className="text-slate-400">สร้างบัญชีสำหรับเข้าใช้งานระบบจัดการสต๊อก</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddUser} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="userName" className="text-slate-300">ชื่อ-นามสกุล *</Label>
              <input
                id="userName"
                placeholder="เช่น สมชาย ใจดี"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#0a101f]/90 border border-blue-500/25 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="userEmail" className="text-slate-300">อีเมล *</Label>
              <input
                id="userEmail"
                type="email"
                placeholder="name@example.com"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#0a101f]/90 border border-blue-500/25 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="userPassword" className="text-slate-300">รหัสผ่านเริ่มต้น *</Label>
              <input
                id="userPassword"
                type="password"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#0a101f]/90 border border-blue-500/25 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="userRole" className="text-slate-300">บทบาท (Role) *</Label>
              <select
                id="userRole"
                value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value as any })}
                className={selectClass}
              >
                <option value="STAFF">พนักงานทั่วไป (STAFF) - ทำรายการสต๊อกได้</option>
                <option value="ADMIN">ผู้ดูแลระบบ (ADMIN) - จัดการข้อมูลทั้งหมดได้</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddModalOpen(false)}
                className="border-blue-900/50 text-slate-300 hover:bg-blue-900/30 hover:text-white"
              >
                ยกเลิก
              </Button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(0,212,255,0.35)] hover:shadow-[0_0_25px_rgba(0,212,255,0.55)] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? 'กำลังบันทึก...' : 'สร้างบัญชีผู้ใช้'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Edit User */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#0d1527] border border-blue-900/50 text-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">แก้ไขข้อมูลผู้ใช้</DialogTitle>
            <DialogDescription className="text-slate-400">{selectedUser?.email}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditUser} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="editName" className="text-slate-300">ชื่อ-นามสกุล *</Label>
              <input
                id="editName"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#0a101f]/90 border border-blue-500/25 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editRole" className="text-slate-300">บทบาท (Role) *</Label>
              <select
                id="editRole"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                className={selectClass}
              >
                <option value="STAFF">พนักงานทั่วไป (STAFF)</option>
                <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editStatus" className="text-slate-300">สถานะการใช้งาน *</Label>
              <select
                id="editStatus"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                className={selectClass}
              >
                <option value="ACTIVE">เปิดใช้งาน (ACTIVE)</option>
                <option value="DISABLED">ระงับการใช้งาน (DISABLED)</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                className="border-blue-900/50 text-slate-300 hover:bg-blue-900/30 hover:text-white"
              >
                ยกเลิก
              </Button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(0,212,255,0.35)] hover:shadow-[0_0_25px_rgba(0,212,255,0.55)] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Delete User */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-sm bg-[#0d1527] border border-blue-900/50 text-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              ยืนยันการลบผู้ใช้
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              คุณต้องการลบผู้ใช้ &quot;{selectedUser?.name}&quot; ({selectedUser?.email}) หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
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
              onClick={handleDeleteUser}
              className="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'กำลังลบ...' : 'ลบผู้ใช้'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
