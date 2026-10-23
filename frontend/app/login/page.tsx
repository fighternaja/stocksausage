'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Package, User, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('เข้าสู่ระบบสำเร็จ');
      router.push('/dashboard');
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const quickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.info(`กรอกข้อมูล ${demoEmail} เรียบร้อย`);
  };

  const handleForgotPassword = () => {
    toast.info('กรุณาติดต่อผู้ดูแลระบบ (ADMIN) เพื่อทำการรีเซ็ตรหัสผ่าน');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0f1d] selection:bg-blue-500/30 selection:text-white">
      {/* Ambient Radial Background Glows */}
      <div className="absolute top-1/4 -right-28 w-[420px] h-[420px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-28 w-[420px] h-[420px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      {/* Subtle Grid overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Main Glassmorphic Login Card */}
      <div className="relative w-full max-w-[420px] rounded-[32px] p-8 sm:p-10 bg-[#121826]/80 backdrop-blur-2xl border border-white/[0.12] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),inset_0_1px_1px_0_rgba(255,255,255,0.18)] transition-all duration-300">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-medium mb-3 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Package className="w-3.5 h-3.5" />
            <span>StockPro</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-1">
            Login
          </h1>
          <p className="text-xs text-slate-400">
            ระบบจัดการสต๊อกสินค้า
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input pill */}
          <div className="space-y-1.5">
            <div className="relative flex items-center rounded-full bg-white/[0.04] border border-white/20 focus-within:border-white/50 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all duration-200 px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]">
              <User className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full bg-transparent text-white placeholder:text-slate-400 focus:outline-none text-sm font-medium"
              />
            </div>
          </div>

          {/* Password input pill */}
          <div className="space-y-1.5">
            <div className="relative flex items-center rounded-full bg-white/[0.04] border border-white/20 focus-within:border-white/50 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all duration-200 px-5 py-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]">
              <Lock className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent text-white placeholder:text-slate-400 focus:outline-none text-sm font-medium pr-2"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-slate-400 hover:text-white transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Forgot Password link */}
          <div className="text-center pt-0.5 pb-1">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Glowing Sign In Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-full font-semibold text-slate-900 text-base bg-gradient-to-b from-white via-slate-100 to-slate-200 hover:from-white hover:to-blue-50 shadow-[0_0_24px_rgba(255,255,255,0.45),0_8px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_35px_rgba(255,255,255,0.7),0_10px_25px_rgba(37,99,235,0.4)] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent" />
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        {/* Demo Quick-fill Accounts */}
        <div className="mt-7 pt-5 border-t border-white/[0.08] text-center">
          <p className="text-[11px] text-slate-400 mb-2.5 font-medium">
            บัญชีทดสอบระบบ (คลิกเพื่อกรอกอัตโนมัติ):
          </p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => quickFill('admin@example.com', 'Admin123!')}
              className="px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-blue-400/30 text-xs text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => quickFill('staff@example.com', 'Staff123!')}
              className="px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-emerald-400/30 text-xs text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Staff</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
