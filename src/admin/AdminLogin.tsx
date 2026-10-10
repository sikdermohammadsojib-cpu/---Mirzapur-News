import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck, KeyRound, ShieldAlert } from 'lucide-react';

interface AdminLoginProps {
  adminPassword?: string;
  onLoginSuccess: (adminName: string) => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  adminPassword,
  onLoginSuccess,
  onBackToSite,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Retrieve the authorized password set by the admin (NO public or hardcoded defaults allowed)
  const getExpectedPassword = (): string => {
    // 1. Check local storage if explicitly saved/changed
    try {
      const savedPass = localStorage.getItem('mirzapur_admin_password');
      if (savedPass && savedPass.trim().length > 0) {
        return savedPass.trim();
      }
    } catch (e) {}

    // 2. Check site settings
    if (adminPassword && adminPassword.trim().length > 0) {
      return adminPassword.trim();
    }

    // 3. The exact secret password specified by the site owner
    return '583594';
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLocked) {
      setError('অতিরিক্ত ভুল পাসওয়ার্ড দেওয়ায় সিস্টেম সাময়িকভাবে লক রয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।');
      return;
    }

    const inputPass = password.trim();
    if (!inputPass) {
      setError('আপনার গোপন পাসওয়ার্ডটি লিখুন।');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const expectedPass = getExpectedPassword();

      // STRICT VALIDATION: ONLY the exact password set by the admin is valid!
      // No standard 'admin', '123456', or other default bypasses exist.
      const isValid = inputPass === expectedPass;

      if (isValid) {
        localStorage.setItem(
          'mirzapur_admin_session_v1',
          JSON.stringify({
            authenticated: true,
            email: 'প্রধান সম্পাদক (Admin)',
            role: 'Super Admin',
            loggedAt: new Date().toISOString(),
          })
        );
        onLoginSuccess('প্রধান সম্পাদক (Admin)');
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        if (nextAttempts >= 4) {
          setIsLocked(true);
          setError('অ্যাক্সেস প্রত্যাখ্যাত! এটি একটি ব্যক্তিগত সুরক্ষিত প্যানেল। অননুমোদিত প্রবেশ সম্পূর্ণ নিষিদ্ধ।');
          setTimeout(() => {
            setIsLocked(false);
            setAttempts(0);
          }, 45000); // 45 seconds lock
        } else {
          setError('ভুল পাসওয়ার্ড! সঠিক গোপন পাসওয়ার্ড ছাড়া প্রবেশ করা যাবে না।');
        }
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
        
        {/* Header */}
        <div className="bg-[#990000] p-6 text-white text-center">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-editorial">প্রশাসনিক প্যানেল</h1>
          <p className="text-xs text-red-200 mt-1">
            ব্যক্তিগত সুরক্ষিত অ্যাডমিন এলাকা
          </p>
        </div>

        {/* Form Body - ONLY the specific password */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>ব্যক্তিগত প্রবেশাধিকার:</strong> এখানে কোনো সাধারণ ডিফল্ট পাসওয়ার্ড কাজ করবে না। শুধুমাত্র আপনার নির্ধারিত গোপন পাসওয়ার্ডটি প্রবেশ করান।
            </p>
          </div>

          <form onSubmit={handlePasswordLogin} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  গোপন পাসওয়ার্ড
                </label>
                <span className="text-[11px] text-red-700 font-semibold">একান্ত ব্যক্তিগত</span>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  autoFocus
                  disabled={isLocked}
                  className="w-full pl-9 pr-10 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 font-sans tracking-wide disabled:bg-gray-100"
                  placeholder="আপনার নির্ধারিত পাসওয়ার্ড দিন..."
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full bg-[#990000] hover:bg-red-800 text-white font-bold py-3 px-4 rounded-lg text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'যাচাই করা হচ্ছে...' : 'প্রবেশ করুন (Login)'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <button
              onClick={onBackToSite}
              className="text-gray-500 hover:text-gray-800 text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ওয়েবসাইটে ফিরে যান</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
