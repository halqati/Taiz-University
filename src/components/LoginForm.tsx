import React, { useState } from 'react';
import { Lock, User as UserIcon, ShieldCheck, AlertCircle, X, KeyRound } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginFormProps {
  onSuccess: (user: User) => void;
  onClose: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onClose }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('يرجى كتابة اسم المستخدم وكلمة المرور');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login(username.trim(), password);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setUsername('admin');
    setPassword('admin123');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">تسجيل دخول المشرف</h2>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل الدخول للوصول إلى لوحة التحكم والتعديل على المكتبة
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستخدم</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pr-9 pl-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden dir-ltr text-right font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pr-9 pl-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden dir-ltr text-right font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              'جاري التحقق...'
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>دخول لوحة التحكم</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            بيانات الدخول التجريبية: <span className="font-bold text-slate-800 dir-ltr inline-block">admin / admin123</span>
          </div>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="text-emerald-700 font-bold hover:underline"
          >
            تعبئة تلقائية
          </button>
        </div>
      </div>
    </div>
  );
};
