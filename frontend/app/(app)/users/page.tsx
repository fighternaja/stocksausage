'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { User } from '@/types';
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
        <div className="p-4 rounded-full bg-amber-100 text-amber-600">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold">ไม่มีสิทธิ์เข้าถึงหน้านี้</h2>
        <p className="text-muted-foreground max-w-md">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">จัดการผู้ใช้งานระบบ</h1>
          <p className="text-muted-foreground">จัดการบัญชีผู้ใช้ สิทธิ์การเข้าถึง และสถานะการใช้งาน</p>
        </div>
        <Button
          onClick={() => {
            setAddForm({ name: '', email: '', password: '', role: 'STAFF' });
            setAddModalOpen(true);
          }}
          className="gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          เพิ่มผู้ใช้ใหม่
        </Button>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ผู้ใช้ทั้งหมด</p>
              <p className="text-xl font-bold">{users.length} คน</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ผู้ดูแลระบบ (ADMIN)</p>
              <p className="text-xl font-bold">
                {users.filter((u) => u.role === 'ADMIN').length} คน
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">พนักงาน (STAFF)</p>
              <p className="text-xl font-bold">
                {users.filter((u) => u.role === 'STAFF').length} คน
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">สถานะใช้งานปกติ</p>
              <p className="text-xl font-bold">
                {users.filter((u) => u.status === 'ACTIVE').length} คน
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
              placeholder="ค้นหาชื่อ หรืออีเมล..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>ผู้ใช้งาน</TableHead>
                <TableHead>อีเมล</TableHead>
                <TableHead className="text-center">บทบาท (Role)</TableHead>
                <TableHead className="text-center">สถานะ (Status)</TableHead>
                <TableHead className="text-center">จำนวนทำรายการสต๊อก</TableHead>
                <TableHead>วันที่สร้าง</TableHead>
                <TableHead className="text-center w-28">การจัดการ</TableHead>
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
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground/50" />
                      <span>ไม่พบข้อมูลผู้ใช้</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">{u.name}</span>
                          {u.id === currentUser?.id && (
                            <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                              (คุณ)
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      {u.email}
                    </TableCell>
                    <TableCell className="text-center">
                      {u.role === 'ADMIN' ? (
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">
                          <Shield className="h-3 w-3 mr-1" />
                          ADMIN
                        </Badge>
                      ) : (
                        <Badge variant="secondary">STAFF</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {u.status === 'ACTIVE' ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">
                          <UserCheck className="h-3 w-3 mr-1" />
                          เปิดใช้งาน
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <UserX className="h-3 w-3 mr-1" />
                          ระงับการใช้งาน
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm text-muted-foreground">
                      {u._count?.stockMovements || 0} ครั้ง
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title="แก้ไขผู้ใช้"
                          onClick={() => handleOpenEdit(u)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          title="ลบผู้ใช้"
                          disabled={u.id === currentUser?.id}
                          onClick={() => {
                            setSelectedUser(u);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal: Add User */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มผู้ใช้งานใหม่</DialogTitle>
            <DialogDescription>สร้างบัญชีสำหรับเข้าใช้งานระบบจัดการสต๊อก</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddUser} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="userName">ชื่อ-นามสกุล *</Label>
              <Input
                id="userName"
                placeholder="เช่น สมชาย ใจดี"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="userEmail">อีเมล *</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="name@example.com"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="userPassword">รหัสผ่านเริ่มต้น *</Label>
              <Input
                id="userPassword"
                type="password"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="userRole">บทบาท (Role) *</Label>
              <select
                id="userRole"
                value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value as any })}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'กำลังบันทึก...' : 'สร้างบัญชีผู้ใช้'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Edit User */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลผู้ใช้</DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditUser} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="editName">ชื่อ-นามสกุล *</Label>
              <Input
                id="editName"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editRole">บทบาท (Role) *</Label>
              <select
                id="editRole"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="STAFF">พนักงานทั่วไป (STAFF)</option>
                <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editStatus">สถานะการใช้งาน *</Label>
              <select
                id="editStatus"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Delete User */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              ยืนยันการลบผู้ใช้
            </DialogTitle>
            <DialogDescription>
              คุณต้องการลบผู้ใช้ &quot;{selectedUser?.name}&quot; ({selectedUser?.email}) หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
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
              onClick={handleDeleteUser}
            >
              {submitting ? 'กำลังลบ...' : 'ลบผู้ใช้'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
