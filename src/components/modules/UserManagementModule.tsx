import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { User, UserRole, ActivityLog, LoginHistory } from '../../types';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  History,
  Activity,
  CheckCircle,
  AlertCircle,
  Search,
  X,
  ShieldAlert,
} from 'lucide-react';

interface UserManagementModuleProps {
  currentUser: User;
}

export const UserManagementModule: React.FC<UserManagementModuleProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [activeTab, setActiveTab] = useState<'users' | 'loginHistory' | 'activityLogs'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Accountant');
  const [newPassword, setNewPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const refreshData = () => {
    setUsers(StorageService.getUsers());
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !username.trim() || !password || !email.trim()) {
      setFormError('جميع الحقول مطلوبة لإضافة المستخدم.');
      return;
    }

    const result = StorageService.createUser(currentUser, {
      fullName,
      username,
      password,
      email,
      role,
    });

    if (result.success) {
      setIsAddModalOpen(false);
      setFullName('');
      setUsername('');
      setPassword('');
      setEmail('');
      setFeedbackMsg(`تم إضافة المستخدم (${result.user?.fullName}) بنجاح`);
      setTimeout(() => setFeedbackMsg(null), 4000);
      refreshData();
    } else {
      setFormError(result.error || 'فشلت إضافة المستخدم');
    }
  };

  const handleToggleStatus = (targetUser: User) => {
    if (targetUser.isOwner) {
      alert('لا يمكن تعطيل حساب مالك النظام!');
      return;
    }

    const res = StorageService.updateUser(currentUser, targetUser.id, {
      isActive: !targetUser.isActive,
    });

    if (res.success) {
      refreshData();
      setFeedbackMsg(
        targetUser.isActive
          ? `تم تعطيل حساب (${targetUser.fullName})`
          : `تم تفعيل حساب (${targetUser.fullName})`
      );
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      alert(res.error);
    }
  };

  const handleDeleteUser = (targetUser: User) => {
    if (targetUser.isOwner) {
      alert('لا يمكن حذف حساب مالك النظام قطعيًا!');
      return;
    }

    if (confirm(`هل أنت متأكد من حذف المستخدم (${targetUser.fullName}) نهائيًا؟`)) {
      const res = StorageService.deleteUser(currentUser, targetUser.id);
      if (res.success) {
        refreshData();
        setFeedbackMsg(`تم حذف المستخدم (${targetUser.fullName}) بنجاح.`);
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        alert(res.error);
      }
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;

    if (newPassword.length < 6) {
      setFormError('كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام.');
      return;
    }

    const res = StorageService.resetPassword(currentUser, selectedUser.id, newPassword);
    if (res.success) {
      setIsResetPassModalOpen(false);
      setNewPassword('');
      setSelectedUser(null);
      setFeedbackMsg(`تم تغيير كلمة المرور للمستخدم (${selectedUser.fullName}) بنجاح.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFormError(res.error || 'فشل إعادة تعيين كلمة المرور');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (r: UserRole, isOwner?: boolean) => {
    if (isOwner) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <Shield className="w-3 h-3 text-amber-700" />
          مالك النظام (Owner)
        </span>
      );
    }
    const rolesMap: Record<UserRole, { label: string; color: string }> = {
      Owner: { label: 'مالك النظام', color: 'bg-amber-100 text-amber-800' },
      Admin: { label: 'مدير نظام', color: 'bg-purple-100 text-purple-800' },
      ChiefAccountant: { label: 'رئيس حسابات', color: 'bg-blue-100 text-blue-800' },
      Auditor: { label: 'مراجع حسابات', color: 'bg-teal-100 text-teal-800' },
      TaxConsultant: { label: 'مستشار ضريبي', color: 'bg-indigo-100 text-indigo-800' },
      Accountant: { label: 'محاسب', color: 'bg-slate-100 text-slate-800' },
      Viewer: { label: 'مشاهد فقط', color: 'bg-gray-100 text-gray-700' },
    };
    const mapped = rolesMap[r] || { label: r, color: 'bg-slate-100 text-slate-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${mapped.color}`}>
        {mapped.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 text-[#0A4DA3] font-bold text-xl">
            <Users className="w-6 h-6" />
            <h2>إدارة المستخدمين والصلاحيات</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            صلاحية حصرية لمالك النظام: إضافة وتعديل وتعطيل المستخدمين وتعيين كلمات المرور.
          </p>
        </div>

        {currentUser.isOwner && (
          <button
            onClick={() => {
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مستخدم جديد</span>
          </button>
        )}
      </div>

      {feedbackMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          قائمة المستخدمين ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('loginHistory')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'loginHistory'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          سجل تسجيل الدخول والأجهزة
        </button>

        <button
          onClick={() => setActiveTab('activityLogs')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'activityLogs'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          سجل النشاطات الرقابي
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="بحث بالاسم أو اسم المستخدم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4DA3]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>

            <span className="text-xs text-slate-500">
              إجمالي الحسابات المسجلة: <strong className="text-slate-800">{users.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                <tr>
                  <th className="p-3.5">المستخدم</th>
                  <th className="p-3.5">اسم الدخول</th>
                  <th className="p-3.5">الرتبة / الصلاحية</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5">آخر دخول</th>
                  <th className="p-3.5">الجهاز</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{user.fullName}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-700 font-medium">
                      {user.username}
                    </td>
                    <td className="p-3.5">{getRoleBadge(user.role, user.isOwner)}</td>
                    <td className="p-3.5">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                          <AlertCircle className="w-3.5 h-3.5" /> معطل
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleString('ar-EG')
                        : 'لم يسجل دخول بعد'}
                    </td>
                    <td className="p-3.5 text-slate-500">{user.device || '—'}</td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {currentUser.isOwner && (
                          <>
                            {/* Reset Password */}
                            <button
                              title="إعادة تعيين كلمة المرور"
                              onClick={() => {
                                setSelectedUser(user);
                                setNewPassword('');
                                setFormError(null);
                                setIsResetPassModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-[#0A4DA3] hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            {/* Toggle Disable / Enable - Forbidden for Owner */}
                            {!user.isOwner ? (
                              <button
                                title={user.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                                onClick={() => handleToggleStatus(user)}
                                className={`p-1.5 rounded-md transition-colors ${
                                  user.isActive
                                    ? 'text-amber-600 hover:bg-amber-50'
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                {user.isActive ? (
                                  <Lock className="w-4 h-4" />
                                ) : (
                                  <Unlock className="w-4 h-4" />
                                )}
                              </button>
                            ) : (
                              <span className="p-1.5 text-slate-300" title="مالك النظام لا يمكن تعطيله">
                                <Lock className="w-4 h-4" />
                              </span>
                            )}

                            {/* Delete User - Forbidden for Owner */}
                            {!user.isOwner ? (
                              <button
                                title="حذف المستخدم"
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="p-1.5 text-slate-300" title="مالك النظام لا يمكن حذفه">
                                <Trash2 className="w-4 h-4" />
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Login History Tab */}
      {activeTab === 'loginHistory' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800">سجل محاولات الدخول والجلسات النشطة</h3>
            <span className="text-[11px] text-slate-400">تتبع أمني فوري لكل محاولة تسجيل دخول</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                <tr>
                  <th className="p-3">الوقت والتاريخ</th>
                  <th className="p-3">اسم المستخدم المدخل</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">الجهاز والمصدر</th>
                  <th className="p-3">المتصفح</th>
                  <th className="p-3">عنوان IP</th>
                  <th className="p-3">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {StorageService.getLoginHistory().map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="p-3 text-slate-600">
                      {new Date(item.timestamp).toLocaleString('ar-EG')}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">{item.username}</td>
                    <td className="p-3">
                      {item.status === 'SUCCESS' && (
                        <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-800 font-bold">
                          ناجح
                        </span>
                      )}
                      {item.status === 'FAILED' && (
                        <span className="px-2 py-0.5 rounded text-[11px] bg-rose-100 text-rose-800 font-bold">
                          فشل
                        </span>
                      )}
                      {item.status === 'BLOCKED' && (
                        <span className="px-2 py-0.5 rounded text-[11px] bg-amber-100 text-amber-800 font-bold">
                          محظور
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600">{item.device}</td>
                    <td className="p-3 text-slate-600">{item.browser}</td>
                    <td className="p-3 font-mono text-slate-500">{item.ip}</td>
                    <td className="p-3 text-slate-500">{item.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Logs Tab */}
      {activeTab === 'activityLogs' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-800">سجل النشاطات الرقابي والعمليات بالنظام</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                <tr>
                  <th className="p-3">التوقيت الفعلي</th>
                  <th className="p-3">المستخدم</th>
                  <th className="p-3">القسم / الوحدة</th>
                  <th className="p-3">الإجراء</th>
                  <th className="p-3">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {StorageService.getActivityLogs().map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="p-3 text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleString('ar-EG')}
                    </td>
                    <td className="p-3 font-bold text-slate-800">{log.username}</td>
                    <td className="p-3 text-blue-700 font-semibold">{log.module}</td>
                    <td className="p-3 font-bold text-slate-900">{log.action}</td>
                    <td className="p-3 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-[#0A4DA3] font-bold text-base">
                <UserPlus className="w-5 h-5" />
                <h3>إضافة مستخدم جديد بواسطة المالك</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: أحمد عبد الله"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4DA3]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  اسم المستخدم (Username) *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="اسم تسجيل الدخول للمستخدم"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4DA3]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">كلمة المرور *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة مرور قوية (6 خانات على الأقل)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4DA3]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@etc-erp.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4DA3]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الدور / الصلاحية *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4DA3]"
                >
                  <option value="Admin">مدير نظام (Admin)</option>
                  <option value="ChiefAccountant">رئيس حسابات (Chief Accountant)</option>
                  <option value="Auditor">مراجع حسابات (Auditor)</option>
                  <option value="TaxConsultant">مستشار ضريبي (Tax Consultant)</option>
                  <option value="Accountant">محاسب (Accountant)</option>
                  <option value="Viewer">مشاهد تقارير فقط (Viewer)</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  حفظ وإنشاء الحساب
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetPassModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-[#0A4DA3] font-bold text-sm">
                <KeyRound className="w-5 h-5" />
                <h3>تعيين كلمة مرور جديدة</h3>
              </div>
              <button
                onClick={() => setIsResetPassModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              إعادة تعيين كلمة المرور للمستخدم:{' '}
              <strong className="text-slate-800">{selectedUser.fullName}</strong> ({selectedUser.username})
            </p>

            {formError && (
              <div className="mb-3 p-2.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">كلمة المرور الجديدة *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4DA3]"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  تأكيد التغيير
                </button>
                <button
                  type="button"
                  onClick={() => setIsResetPassModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
