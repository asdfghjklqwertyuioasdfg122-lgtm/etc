import React, { useState } from 'react';
import { StorageService, SYSTEM_PERMISSIONS } from '../../services/storage';
import { User, CustomRole } from '../../types';
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
  ShieldCheck,
  Crown,
  Eye,
  EyeOff,
  Phone,
  Briefcase,
  Layers,
  FileText,
  Calendar,
  Filter,
  Plus,
} from 'lucide-react';

interface UserManagementModuleProps {
  currentUser: User;
  initialTab?: 'users' | 'roles' | 'loginHistory' | 'activityLogs';
}

export const UserManagementModule: React.FC<UserManagementModuleProps> = ({
  currentUser,
  initialTab = 'users',
}) => {
  const isOwner = currentUser.isOwner || currentUser.role.includes('Owner');

  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [roles, setRoles] = useState<CustomRole[]>(StorageService.getRoles());
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'loginHistory' | 'activityLogs'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);

  // Add User Form States - STRICTLY MANUAL ENTRY ONLY
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [role, setRole] = useState<string>('محاسب (Accountant)');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  // Edit User Form States
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editIsActive, setEditIsActive] = useState(true);

  // Reset Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Role Form States
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);

  // Feedback and errors
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const refreshData = () => {
    setUsers(StorageService.getUsers());
    setRoles(StorageService.getRoles());
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Guard: Strictly Owner Only for User & Role administration
  if (!isOwner && activeTab !== 'activityLogs' && activeTab !== 'loginHistory') {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-xl mx-auto shadow-sm">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">منطقة محظورة • صلاحية المالك فقط</h2>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          وفقاً لقواعد الأمان والرقابة الصارمة لمنصة ETC، صفحة إدارة المستخدمين وتعيين الأدوار مخصصة حصرياً لمالك النظام (محمد عبد الغني).
        </p>
        <button
          onClick={() => setActiveTab('activityLogs')}
          className="px-4 py-2 bg-[#0A4DA3] hover:bg-[#1565C0] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          الانتقال إلى سجل النشاط والتدقيق الرقابي
        </button>
      </div>
    );
  }

  // Handle Create User - ONLY OWNER, STRICTLY MANUAL ENTRY
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !username.trim() || !password || !email.trim()) {
      setFormError('يرجى ملء جميع الحقول الإلزامية يدويًا (الاسم، اسم المستخدم، كلمة المرور، البريد).');
      return;
    }

    if (username.length < 3) {
      setFormError('اسم المستخدم يجب ألا يقل عن 3 أحرف أو أرقام.');
      return;
    }

    if (password.length < 6) {
      setFormError('كلمة المرور يجب ألا تقل عن 6 خانات.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('كلمة المرور وتأكيد كلمة المرور غير متطابقين.');
      return;
    }

    const res = StorageService.createUser(currentUser, {
      fullName: fullName.trim(),
      username: username.trim(),
      password,
      email: email.trim(),
      phone: phone.trim() || undefined,
      department: department.trim() || undefined,
      jobTitle: jobTitle.trim() || undefined,
      role,
      permissions: userPermissions,
    });

    if (res.success && res.user) {
      setIsAddUserModalOpen(false);
      // Reset form
      setFullName('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setEmail('');
      setPhone('');
      setDepartment('');
      setJobTitle('');
      setUserPermissions([]);
      refreshData();
      showFeedback(`تم إنشاء حساب المستخدم (${res.user.fullName}) بنجاح.`);
    } else {
      setFormError(res.error || 'حدث خطأ أثناء إنشاء المستخدم.');
    }
  };

  // Open Edit Modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditFullName(user.fullName);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditDepartment(user.department || '');
    setEditJobTitle(user.jobTitle || '');
    setEditRole(user.role);
    setEditPermissions(user.permissions || []);
    setEditIsActive(user.isActive);
    setFormError(null);
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError(null);

    if (!editFullName.trim() || !editEmail.trim()) {
      setFormError('الاسم الكامل والبريد الإلكتروني مطلوبان.');
      return;
    }

    const res = StorageService.updateUser(currentUser, selectedUser.id, {
      fullName: editFullName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim() || undefined,
      department: editDepartment.trim() || undefined,
      jobTitle: editJobTitle.trim() || undefined,
      role: editRole,
      permissions: editPermissions,
      isActive: editIsActive,
    });

    if (res.success) {
      setIsEditUserModalOpen(false);
      setSelectedUser(null);
      refreshData();
      showFeedback(`تم تحديث بيانات المستخدم (${editFullName}) بنجاح.`);
    } else {
      setFormError(res.error || 'فشل تحديث بيانات المستخدم.');
    }
  };

  // Toggle User Status: ✅ نشط / ⛔ موقوف
  const handleToggleStatus = (targetUser: User) => {
    if (targetUser.isOwner) {
      alert('لا يمكن إيقاف حساب مالك النظام نهائياً!');
      return;
    }

    const newStatus = !targetUser.isActive;
    const res = StorageService.updateUser(currentUser, targetUser.id, {
      isActive: newStatus,
    });

    if (res.success) {
      refreshData();
      showFeedback(
        newStatus
          ? `✅ تم تفعيل حساب المستخدم (${targetUser.fullName})`
          : `⛔ تم إيقاف حساب المستخدم (${targetUser.fullName}) - سيظهر له "تم إيقاف الحساب بواسطة إدارة النظام"`
      );
    } else {
      alert(res.error);
    }
  };

  // Delete User - Forbidden for Owner
  const handleDeleteUser = (targetUser: User) => {
    if (targetUser.isOwner) {
      alert('حساب مالك النظام (محمد عبد الغني) محمي نهائياً ولا يمكن حذفه قطعيًا!');
      return;
    }

    if (confirm(`هل أنت متأكد من حذف حساب المستخدم (${targetUser.fullName}) نهائياً من النظام؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      const res = StorageService.deleteUser(currentUser, targetUser.id);
      if (res.success) {
        refreshData();
        showFeedback(`تم حذف المستخدم (${targetUser.fullName}) بنجاح.`);
      } else {
        alert(res.error);
      }
    }
  };

  // Reset Password - Manual Entry & Robust bcrypt Hashing
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError(null);

    if (!newPassword || newPassword.length < 6) {
      setFormError('كلمة المرور يجب ألا تقل عن 6 خانات.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setFormError('كلمتا المرور غير متطابقتين.');
      return;
    }

    const res = StorageService.resetPassword(currentUser, selectedUser.id, newPassword);
    if (res.success) {
      setIsResetPassModalOpen(false);
      setNewPassword('');
      setConfirmNewPassword('');
      setSelectedUser(null);
      refreshData();
      showFeedback(`تمت إعادة تعيين وتشفير كلمة المرور للمستخدم (${selectedUser.fullName}) بنجاح.`);
    } else {
      setFormError(res.error || 'فشل إعادة تعيين كلمة المرور.');
    }
  };

  // Role Management Operations
  const openAddRoleModal = () => {
    setSelectedRole(null);
    setRoleName('');
    setRoleDescription('');
    setRolePermissions([]);
    setFormError(null);
    setIsRoleModalOpen(true);
  };

  const openEditRoleModal = (r: CustomRole) => {
    setSelectedRole(r);
    setRoleName(r.name);
    setRoleDescription(r.description);
    setRolePermissions(r.permissions);
    setFormError(null);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!roleName.trim()) {
      setFormError('يرجى كتابة اسم الدور.');
      return;
    }

    if (selectedRole) {
      const res = StorageService.updateRole(currentUser, selectedRole.id, {
        name: roleName.trim(),
        description: roleDescription.trim(),
        permissions: rolePermissions,
      });
      if (res.success) {
        setIsRoleModalOpen(false);
        refreshData();
        showFeedback(`تم تعديل صلاحيات الدور (${roleName}) بنجاح.`);
      } else {
        setFormError(res.error || 'فشل تعديل الدور.');
      }
    } else {
      const res = StorageService.createRole(currentUser, {
        name: roleName.trim(),
        description: roleDescription.trim(),
        permissions: rolePermissions,
      });
      if (res.success) {
        setIsRoleModalOpen(false);
        refreshData();
        showFeedback(`تم إنشاء الدور الجديد (${roleName}) بنجاح.`);
      } else {
        setFormError(res.error || 'فشل إنشاء الدور.');
      }
    }
  };

  // Handlers
  const handleDeleteRole = (r: CustomRole) => {
    if (r.isSystem || r.id === 'role_owner') {
      showFeedback('لا يمكن حذف هذا الدور النظامي المحمي!');
      return;
    }
    const res = StorageService.deleteRole(currentUser, r.id);
    if (res.success) {
      refreshData();
      showFeedback(`تم حذف الدور (${r.name}) بنجاح.`);
    } else {
      showFeedback(res.error || 'تعذر حذف هذا الدور.');
    }
  };

  // Filtering
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.jobTitle && u.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? u.isActive : !u.isActive;

    const matchRole = roleFilter === 'all' ? true : u.role === roleFilter;

    return matchSearch && matchStatus && matchRole;
  });

  const activeCount = users.filter((u) => u.isActive).length;
  const suspendedCount = users.filter((u) => !u.isActive).length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-[#0A4DA3] font-bold text-xl">
            <Users className="w-6 h-6" />
            <h2>👥 إدارة المستخدمين</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            لوحة الإشراف الرقابي الحصرية لمالك النظام (محمد عبد الغني) • إنشاء وإدارة المستخدمين وتعيين الصلاحيات وسجلات الأمان
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => {
              setFormError(null);
              setIsAddUserModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>➕ إضافة مستخدم جديد</span>
          </button>
        )}
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-semibold mb-1">إجمالي المستخدمين</div>
          <div className="text-2xl font-black text-slate-800">{users.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs">
          <div className="text-[11px] text-emerald-700 font-semibold mb-1">✅ الحسابات النشطة</div>
          <div className="text-2xl font-black text-emerald-700">{activeCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-xs">
          <div className="text-[11px] text-rose-700 font-semibold mb-1">⛔ الحسابات الموقوفة</div>
          <div className="text-2xl font-black text-rose-700">{suspendedCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-indigo-200/80 shadow-xs">
          <div className="text-[11px] text-indigo-700 font-semibold mb-1">الأدوار والصلاحيات</div>
          <div className="text-2xl font-black text-indigo-700">{roles.length}</div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          📋 عرض المستخدمين ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'roles'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          الأدوار والصلاحيات ({roles.length})
        </button>

        <button
          onClick={() => setActiveTab('loginHistory')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'loginHistory'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          📅 سجل تسجيل الدخول
        </button>

        <button
          onClick={() => setActiveTab('activityLogs')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'activityLogs'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          📄 سجل النشاطات
        </button>
      </div>

      {/* TAB 1: 📋 عرض المستخدمين */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Filter & Search Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative w-full max-w-xs">
                <input
                  type="text"
                  placeholder="🔍 البحث بالاسم، اسم المستخدم، البريد، القسم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
              >
                <option value="all">كل الحالات</option>
                <option value="active">✅ نشط فقط</option>
                <option value="suspended">⛔ موقوف فقط</option>
              </select>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
              >
                <option value="all">كل الأدوار</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs text-slate-500 whitespace-nowrap">
              النتائج: <strong className="text-slate-800">{filteredUsers.length}</strong> من إجمالي {users.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                <tr>
                  <th className="p-3.5">الاسم بالكامل</th>
                  <th className="p-3.5">اسم المستخدم</th>
                  <th className="p-3.5">القسم والوظيفة</th>
                  <th className="p-3.5">الدور والصلاحيات</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5">آخر دخول والجهاز</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        {user.isOwner ? (
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                            👑
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0A4DA3] flex items-center justify-center font-bold">
                            {user.fullName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{user.fullName}</span>
                            {user.isOwner && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black border border-amber-300">
                                مالك النظام الدائم
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{user.email}</div>
                          {user.phone && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-800 font-bold">
                      {user.username}
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{user.department || '—'}</div>
                      <div className="text-[11px] text-slate-500">{user.jobTitle || '—'}</div>
                    </td>

                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {user.isOwner ? '👑 مالك النظام' : user.role}
                      </span>
                    </td>

                    <td className="p-3.5">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          ✅ نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5" />
                          ⛔ موقوف
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-600">
                      <div>
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleString('ar-EG')
                          : 'لم يسجل دخول بعد'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{user.device || 'محلي آمن'}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1">
                        {/* Edit User ✏️ */}
                        <button
                          title="تعديل المستخدم"
                          onClick={() => openEditModal(user)}
                          className="p-2 text-slate-600 hover:text-[#0A4DA3] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Reset Password 🔑 */}
                        <button
                          title="إعادة تعيين كلمة المرور"
                          onClick={() => {
                            setSelectedUser(user);
                            setNewPassword('');
                            setConfirmNewPassword('');
                            setFormError(null);
                            setIsResetPassModalOpen(true);
                          }}
                          className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Toggle Suspend ⛔ / Activate ✅ */}
                        {!user.isOwner ? (
                          <button
                            title={user.isActive ? 'إيقاف المستخدم' : 'تفعيل المستخدم'}
                            onClick={() => handleToggleStatus(user)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              user.isActive
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        ) : (
                          <span className="p-2 text-slate-300" title="مالك النظام محمي لا يمكن إيقافه">
                            <Lock className="w-4 h-4" />
                          </span>
                        )}

                        {/* Delete User ❌ */}
                        {!user.isOwner ? (
                          <button
                            title="حذف المستخدم نهائياً"
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="p-2 text-slate-300" title="مالك النظام محمي لا يمكن حذفه">
                            <Trash2 className="w-4 h-4" />
                          </span>
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

      {/* TAB 2: الأدوار والصلاحيات */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-base text-slate-900">الأدوار المعتمدة بالنظام</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تحديد وتخصيص صلاحيات الوصول لمختلف الوحدات المحاسبية والإدارية
                </p>
              </div>

              <button
                onClick={openAddRoleModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0A4DA3] hover:bg-[#1565C0] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة دور مخصص جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {r.id === 'role_owner' ? <Crown className="w-4 h-4 text-amber-500" /> : <ShieldCheck className="w-4 h-4 text-[#0A4DA3]" />}
                        <span>{r.name}</span>
                      </div>
                      {r.isSystem && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                          نظامي
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{r.description}</p>
                    <div className="text-[11px] font-semibold text-slate-700 mb-2">
                      الصلاحيات الممنوحة ({r.permissions.length}):
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4 max-h-28 overflow-y-auto">
                      {r.permissions.map((pId) => {
                        const perm = SYSTEM_PERMISSIONS.find((sp) => sp.id === pId);
                        return (
                          <span
                            key={pId}
                            className="px-2 py-0.5 rounded bg-blue-50 text-[#0A4DA3] text-[10px] font-medium border border-blue-100"
                          >
                            {perm?.name || pId}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {r.id !== 'role_owner' && (
                    <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditRoleModal(r)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#0A4DA3] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        تعديل الصلاحيات
                      </button>
                      {!r.isSystem && (
                        <button
                          onClick={() => handleDeleteRole(r)}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          حذف الدور
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Permissions Catalog Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h4 className="font-bold text-xs text-slate-800">كتالوج الصلاحيات الأساسية للنظام</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">تفصيل كافة الصلاحيات المتاحة للإسناد والتخصيص</p>
            </div>
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">رمز الصلاحية</th>
                  <th className="p-3">اسم الصلاحية</th>
                  <th className="p-3">التصنيف</th>
                  <th className="p-3">الوصف والتأثير</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SYSTEM_PERMISSIONS.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-slate-500 font-bold">{p.id}</td>
                    <td className="p-3 font-bold text-slate-800">{p.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-semibold">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 📅 سجل تسجيل الدخول */}
      {activeTab === 'loginHistory' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">سجل تسجيل الدخول ومحاولات الوصول</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">تتبع أمني فوري لكل محاولة دخول للنظام</p>
            </div>
            <span className="text-xs text-slate-500">
              إجمالي السجلات: <strong className="text-slate-800">{StorageService.getLoginHistory().length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                <tr>
                  <th className="p-3.5">الوقت والتاريخ</th>
                  <th className="p-3.5">اسم المستخدم</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5">الجهاز</th>
                  <th className="p-3.5">المتصفح</th>
                  <th className="p-3.5">عنوان IP</th>
                  <th className="p-3.5">السبب / الملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {StorageService.getLoginHistory().map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5 text-slate-600 font-mono">
                      {new Date(log.timestamp).toLocaleString('ar-EG')}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{log.username}</td>
                    <td className="p-3.5">
                      {log.status === 'SUCCESS' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ناجح
                        </span>
                      )}
                      {log.status === 'FAILED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          فاشل
                        </span>
                      )}
                      {log.status === 'BLOCKED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          محظور / موقوف
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600">{log.device || 'كمبيوتر مكتبي'}</td>
                    <td className="p-3.5 text-slate-600">{log.browser || 'متصفح ويب حديث'}</td>
                    <td className="p-3.5 font-mono text-slate-500">{log.ip || '127.0.0.1'}</td>
                    <td className="p-3.5 text-slate-600">{log.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: 📄 سجل النشاطات الرقابي */}
      {activeTab === 'activityLogs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">سجل النشاطات الرقابي (Audit Trail)</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تتبع العمليات الحساسة: الدخول، الخروج، إنشاء وحذف المستخدمين، تغيير كلمات المرور، والصلاحيات
              </p>
            </div>
            <span className="text-xs text-slate-500">
              إجمالي العمليات: <strong className="text-slate-800">{StorageService.getActivityLogs().length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                <tr>
                  <th className="p-3.5">الوقت والتاريخ</th>
                  <th className="p-3.5">القائم بالعملية</th>
                  <th className="p-3.5">نوع الإجراء</th>
                  <th className="p-3.5">الوحدة</th>
                  <th className="p-3.5">تفاصيل الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {StorageService.getActivityLogs().map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5 text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleString('ar-EG')}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{log.username}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{log.module}</td>
                    <td className="p-3.5 text-slate-700 font-medium">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ➕ إضافة مستخدم (STRICTLY MANUAL ENTRY ONLY) */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 md:p-8 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2.5 text-[#0A4DA3]">
                <UserPlus className="w-6 h-6" />
                <h3 className="text-lg font-bold text-slate-900">إضافة مستخدم جديد</h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Notice: Strict Manual Entry */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                <strong>تنبيه أمني صارم:</strong> وفقاً لمعايير الرقابة الداخلية لمنصة ETC، لا يقوم النظام بتوليد اسم المستخدم أو كلمة المرور تلقائياً؛ يجب على المالك إدخال كافة البيانات يدوياً.
              </div>

              {/* الاسم بالكامل */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم بالكامل *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: أحمد محمود علي"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  required
                />
              </div>

              {/* اسم المستخدم & البريد الإلكتروني */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المستخدم (Username) *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="مثال: ahmad_ali"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                    autoComplete="off"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ahmad@company.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                    required
                  />
                </div>
              </div>

              {/* كلمة المرور & تأكيد كلمة المرور */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    كلمة المرور *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تأكيد كلمة المرور *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              {/* رقم الهاتف، القسم، الوظيفة */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    القسم
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="مثال: الإدارة المالية"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الوظيفة
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="مثال: محاسب عام أول"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>
              </div>

              {/* الدور */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الدور النظامي *
                </label>
                <select
                  value={role}
                  onChange={(e) => {
                    const chosenRole = e.target.value;
                    setRole(chosenRole);
                    const foundRole = roles.find((r) => r.name === chosenRole);
                    if (foundRole) {
                      setUserPermissions(foundRole.permissions);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  required
                >
                  {roles
                    .filter((r) => r.id !== 'role_owner')
                    .map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* مصفوفة الصلاحيات المخصصة */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الصلاحيات المفعلة لهذا المستخدم:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
                  {SYSTEM_PERMISSIONS.filter((p) => p.id !== 'user.manage').map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userPermissions.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserPermissions([...userPermissions, p.id]);
                          } else {
                            setUserPermissions(userPermissions.filter((id) => id !== p.id));
                          }
                        }}
                        className="rounded border-slate-300 text-[#0A4DA3] focus:ring-[#0A4DA3]"
                      />
                      <span>{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  إنشاء المستخدم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ✏️ تعديل مستخدم */}
      {isEditUserModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 md:p-8 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2 text-[#0A4DA3]">
                <Edit2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  تعديل بيانات: {selectedUser.fullName}
                </h3>
              </div>
              <button
                onClick={() => setIsEditUserModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الاسم بالكامل</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  disabled={selectedUser.isOwner}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3] disabled:opacity-60"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">القسم</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الوظيفة</label>
                  <input
                    type="text"
                    value={editJobTitle}
                    onChange={(e) => setEditJobTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>
              </div>

              {!selectedUser.isOwner && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الدور</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                    >
                      {roles
                        .filter((r) => r.id !== 'role_owner')
                        .map((r) => (
                          <option key={r.id} value={r.name}>
                            {r.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">حالة الحساب</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          checked={editIsActive}
                          onChange={() => setEditIsActive(true)}
                          className="text-[#0A4DA3] focus:ring-[#0A4DA3]"
                        />
                        <span>✅ نشط</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          checked={!editIsActive}
                          onChange={() => setEditIsActive(false)}
                          className="text-rose-600 focus:ring-rose-600"
                        />
                        <span>⛔ موقوف (تم إيقاف الحساب بواسطة إدارة النظام)</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0A4DA3] hover:bg-[#1565C0] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: 🔑 إعادة تعيين كلمة المرور */}
      {isResetPassModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2 text-[#0A4DA3]">
                <KeyRound className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  إعادة تعيين كلمة المرور: {selectedUser.fullName}
                </h3>
              </div>
              <button
                onClick={() => setIsResetPassModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                أدخل كلمة المرور الجديدة يدوياً للمستخدم. سيتم تشفيرها فورياً بخوارزمية bcrypt مع ملح أمني عشوائي (Salt) ومعامل تعقيد، ولن تُعرض مرة أخرى.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كلمة المرور الجديدة *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تأكيد كلمة المرور الجديدة *
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResetPassModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0A4DA3] hover:bg-[#1565C0] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  تحديث كلمة المرور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: 🛡️ إضافة / تعديل دور وصلاحيات */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 md:p-8 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2 text-[#0A4DA3]">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  {selectedRole ? `تعديل صلاحيات: ${selectedRole.name}` : 'إضافة دور جديد'}
                </h3>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الدور *</label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="مثال: مراجع ضريبي مساعد"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف الدور</label>
                <textarea
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  rows={2}
                  placeholder="وصف المهام الموكلة لهذا الدور..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">الصلاحيات الممنوحة لهذا الدور:</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (rolePermissions.length === SYSTEM_PERMISSIONS.length) {
                        setRolePermissions([]);
                      } else {
                        setRolePermissions(SYSTEM_PERMISSIONS.filter((p) => p.id !== 'user.manage').map((p) => p.id));
                      }
                    }}
                    className="text-[11px] font-bold text-[#0A4DA3] hover:underline cursor-pointer"
                  >
                    {rolePermissions.length > 0 ? 'إلغاء التحديد' : 'تحديد الكل'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-56 overflow-y-auto">
                  {SYSTEM_PERMISSIONS.filter((p) => p.id !== 'user.manage').map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rolePermissions.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRolePermissions([...rolePermissions, p.id]);
                          } else {
                            setRolePermissions(rolePermissions.filter((id) => id !== p.id));
                          }
                        }}
                        className="rounded border-slate-300 text-[#0A4DA3] focus:ring-[#0A4DA3]"
                      />
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.category}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0A4DA3] hover:bg-[#1565C0] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  حفظ الدور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
