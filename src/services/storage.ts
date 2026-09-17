/**
 * ETC ERP Storage Service
 * Manages persistent state with zero fake data, full audit logs, and owner enforcement.
 */

import {
  User,
  LoginHistory,
  ActivityLog,
  UserSession,
  Account,
  JournalEntry,
  Partner,
  InventoryItem,
  FixedAsset,
  AuditWorkingPaper,
  TaxDeclaration,
  SystemNotification,
  ChatMessage,
  UploadedDocument,
  CustomRole,
  RolePermission,
} from '../types';
import { hashPassword, verifyPassword, isBcryptHash } from '../utils/crypto';

const STORAGE_KEYS = {
  USERS: 'etc_erp_users_v3',
  CURRENT_USER: 'etc_erp_current_user_v3',
  ROLES: 'etc_erp_roles_v3',
  LOGIN_HISTORY: 'etc_erp_login_history',
  ACTIVITY_LOGS: 'etc_erp_activity_logs',
  SESSIONS: 'etc_erp_sessions',
  ACCOUNTS: 'etc_erp_accounts',
  JOURNAL_ENTRIES: 'etc_erp_journal_entries',
  PARTNERS: 'etc_erp_partners',
  INVENTORY: 'etc_erp_inventory',
  FIXED_ASSETS: 'etc_erp_fixed_assets',
  AUDIT_PAPERS: 'etc_erp_audit_papers',
  TAX_DECLARATIONS: 'etc_erp_tax_declarations',
  NOTIFICATIONS: 'etc_erp_notifications',
  CHATS: 'etc_erp_chats',
  DOCUMENTS: 'etc_erp_documents',
  REMEMBER_USER: 'etc_erp_remember_user',
};

// System Permissions catalog
export const SYSTEM_PERMISSIONS: RolePermission[] = [
  { id: 'accounting.view', name: 'استعراض القيود والحسابات', category: 'المحاسبة', description: 'الاطلاع على دفتر اليومية وميزان المراجعة' },
  { id: 'accounting.create', name: 'تسجيل قيود اليومية', category: 'المحاسبة', description: 'إدخال قيود اليومية المزدوجة' },
  { id: 'accounting.post', name: 'ترحيل واعتماد القيود', category: 'المحاسبة', description: 'اعتماد وترحيل القيود للحسابات العامة' },
  { id: 'statements.view', name: 'القوائم المالية والختامية', category: 'التقارير', description: 'استعراض قائمة الدخل والمركز المالي والتدفقات' },
  { id: 'commercial.manage', name: 'العملاء والموردون والمخزون', category: 'التجاري', description: 'إدارة شركاء الأعمال وحركات المستودعات' },
  { id: 'tax.manage', name: 'المنظومة الضريبية المصرية', category: 'الضرائب', description: 'إعداد ومراجعة إقرارات القيمة المضافة ونموذج 41' },
  { id: 'audit.manage', name: 'المراجعة والرقابة الدفترية', category: 'المراجعة', description: 'إعداد أوراق العمل وفحص الامتثال' },
  { id: 'analysis.view', name: 'التحليل المالي والمؤشرات', category: 'التحليل', description: 'الاطلاع على نسب السيولة والربحية والـ KPIs' },
  { id: 'ai.access', name: 'مستشار ETC AI الذكي', category: 'الذكاء الاصطناعي', description: 'استخدام المساعد المالي والضريبي الذكي' },
  { id: 'user.manage', name: 'إدارة المستخدمين والصلاحيات', category: 'الأمان', description: 'حصرية لمالك النظام (محمد عبد الغني)' },
];

const DEFAULT_ROLES: CustomRole[] = [
  {
    id: 'role_owner',
    name: '👑 System Owner',
    description: 'مالك النظام الدائم - صلاحيات مطلقة كاملة لإدارة المنصة والمستخدمين',
    permissions: SYSTEM_PERMISSIONS.map((p) => p.id),
    isSystem: true,
  },
  {
    id: 'role_admin',
    name: 'مدير نظام (Admin)',
    description: 'إدارة العمليات التشغيلية والمحاسبية والفنية',
    permissions: ['accounting.view', 'accounting.create', 'accounting.post', 'statements.view', 'commercial.manage', 'tax.manage', 'audit.manage', 'analysis.view', 'ai.access'],
    isSystem: true,
  },
  {
    id: 'role_chief_accountant',
    name: 'رئيس حسابات (Chief Accountant)',
    description: 'مراجعة وترحيل القيود وإعداد القوائم الختامية',
    permissions: ['accounting.view', 'accounting.create', 'accounting.post', 'statements.view', 'commercial.manage', 'tax.manage', 'analysis.view', 'ai.access'],
    isSystem: true,
  },
  {
    id: 'role_auditor',
    name: 'مراجع حسابات (Auditor)',
    description: 'فحص الحسابات والرقابة الدفترية وأوراق التدقيق',
    permissions: ['accounting.view', 'statements.view', 'audit.manage', 'analysis.view', 'tax.manage', 'ai.access'],
    isSystem: true,
  },
  {
    id: 'role_tax_consultant',
    name: 'مستشار ضريبي (Tax Consultant)',
    description: 'متابعة الفاتورة الإلكترونية والإقرارات الضريبية المصرية',
    permissions: ['tax.manage', 'statements.view', 'accounting.view', 'ai.access'],
    isSystem: true,
  },
  {
    id: 'role_accountant',
    name: 'محاسب (Accountant)',
    description: 'تسجيل قيود اليومية ومتابعة العملاء والموردين',
    permissions: ['accounting.view', 'accounting.create', 'commercial.manage', 'ai.access'],
    isSystem: true,
  },
  {
    id: 'role_viewer',
    name: 'مشاهد فقط (Viewer)',
    description: 'استعراض التقارير دون إمكانية التعديل أو الحذف',
    permissions: ['statements.view', 'analysis.view'],
    isSystem: true,
  },
];

// Initial standard Egyptian Chart of Accounts framework (Zero balances)
const STANDARD_EGYPTIAN_CHART: Account[] = [
  { id: '1', code: '1', nameAr: 'الأصول', nameEn: 'Assets', type: 'Asset', level: 1, balance: 0, isActive: true },
  { id: '11', code: '11', nameAr: 'الأصول المتداولة', nameEn: 'Current Assets', type: 'Asset', parentId: '1', level: 2, balance: 0, isActive: true },
  { id: '111', code: '111', nameAr: 'النقدية بالصندوق والبنوك', nameEn: 'Cash & Banks', type: 'Asset', parentId: '11', level: 3, balance: 0, isActive: true },
  { id: '112', code: '112', nameAr: 'العملاء والمدينون', nameEn: 'Accounts Receivable', type: 'Asset', parentId: '11', level: 3, balance: 0, isActive: true },
  { id: '113', code: '113', nameAr: 'المخزون السلعي', nameEn: 'Inventory', type: 'Asset', parentId: '11', level: 3, balance: 0, isActive: true },
  { id: '12', code: '12', nameAr: 'الأصول غير المتداولة (الثابتة)', nameEn: 'Non-Current Assets', type: 'Asset', parentId: '1', level: 2, balance: 0, isActive: true },
  { id: '121', code: '121', nameAr: 'الآلات والمعدات', nameEn: 'Machinery & Equipment', type: 'Asset', parentId: '12', level: 3, balance: 0, isActive: true },
  { id: '122', code: '122', nameAr: 'وسائل النقل والانتقال', nameEn: 'Vehicles', type: 'Asset', parentId: '12', level: 3, balance: 0, isActive: true },
  { id: '2', code: '2', nameAr: 'الالتزامات', nameEn: 'Liabilities', type: 'Liability', level: 1, balance: 0, isActive: true },
  { id: '21', code: '21', nameAr: 'الالتزامات المتداولة', nameEn: 'Current Liabilities', type: 'Liability', parentId: '2', level: 2, balance: 0, isActive: true },
  { id: '211', code: '211', nameAr: 'الموردون والدائنون', nameEn: 'Accounts Payable', type: 'Liability', parentId: '21', level: 3, balance: 0, isActive: true },
  { id: '212', code: '212', nameAr: 'مصلحة الضرائب (القيمة المضافة)', nameEn: 'Tax Authority - VAT', type: 'Liability', parentId: '21', level: 3, balance: 0, isActive: true },
  { id: '213', code: '213', nameAr: 'مصلحة الضرائب (كسب العمل)', nameEn: 'Tax Authority - Payroll', type: 'Liability', parentId: '21', level: 3, balance: 0, isActive: true },
  { id: '3', code: '3', nameAr: 'حقوق الملكية', nameEn: 'Equity', type: 'Equity', level: 1, balance: 0, isActive: true },
  { id: '31', code: '31', nameAr: 'رأس المال المدفوع', nameEn: 'Paid-in Capital', type: 'Equity', parentId: '3', level: 2, balance: 0, isActive: true },
  { id: '32', code: '32', nameAr: 'الأرباح (الخسائر) المرحلة', nameEn: 'Retained Earnings', type: 'Equity', parentId: '3', level: 2, balance: 0, isActive: true },
  { id: '4', code: '4', nameAr: 'الإيرادات', nameEn: 'Revenues', type: 'Revenue', level: 1, balance: 0, isActive: true },
  { id: '41', code: '41', nameAr: 'إيرادات المبيعات والخدمات', nameEn: 'Sales & Services Revenue', type: 'Revenue', parentId: '4', level: 2, balance: 0, isActive: true },
  { id: '5', code: '5', nameAr: 'المصروفات', nameEn: 'Expenses', type: 'Expense', level: 1, balance: 0, isActive: true },
  { id: '51', code: '51', nameAr: 'تكلفة المبيعات / النشاط', nameEn: 'Cost of Goods Sold', type: 'Expense', parentId: '5', level: 2, balance: 0, isActive: true },
  { id: '52', code: '52', nameAr: 'المصروفات العمومية والإدارية', nameEn: 'General & Admin Expenses', type: 'Expense', parentId: '5', level: 2, balance: 0, isActive: true },
  { id: '53', code: '53', nameAr: 'مصروفات الإهلاك', nameEn: 'Depreciation Expense', type: 'Expense', parentId: '5', level: 2, balance: 0, isActive: true },
];

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

export const StorageService = {
  // Roles Management (Owner exclusive)
  getRoles(): CustomRole[] {
    const roles = getStored<CustomRole[]>(STORAGE_KEYS.ROLES, []);
    if (roles.length === 0) {
      setStored(STORAGE_KEYS.ROLES, DEFAULT_ROLES);
      return DEFAULT_ROLES;
    }
    return roles;
  },

  createRole(
    editor: User,
    roleData: { name: string; description: string; permissions: string[] }
  ): { success: boolean; role?: CustomRole; error?: string } {
    if (!editor.isOwner) {
      return { success: false, error: 'فقط مالك النظام (محمد عبد الغني) يمتلك صلاحية إنشاء الأدوار.' };
    }
    if (!roleData.name.trim()) {
      return { success: false, error: 'يرجى إدخال مسمى الدور.' };
    }
    const roles = this.getRoles();
    if (roles.some((r) => r.name.toLowerCase() === roleData.name.trim().toLowerCase())) {
      return { success: false, error: 'مسمى الدور موجود بالفعل.' };
    }

    const newRole: CustomRole = {
      id: 'role_' + Date.now(),
      name: roleData.name.trim(),
      description: roleData.description.trim(),
      permissions: roleData.permissions,
      isSystem: false,
    };
    roles.push(newRole);
    setStored(STORAGE_KEYS.ROLES, roles);

    this.addActivityLog({
      userId: editor.id,
      username: editor.username,
      action: 'إنشاء دور وصلاحيات جديدة',
      module: 'إدارة الأدوار والصلاحيات',
      details: `قام المالك بإنشاء الدور (${newRole.name}) وتحديد ${newRole.permissions.length} صلاحية له`,
    });

    return { success: true, role: newRole };
  },

  updateRole(
    editor: User,
    roleId: string,
    roleData: { name: string; description: string; permissions: string[] }
  ): { success: boolean; error?: string } {
    if (!editor.isOwner) {
      return { success: false, error: 'فقط مالك النظام يمتلك صلاحية تعديل الأدوار.' };
    }
    const roles = this.getRoles();
    const index = roles.findIndex((r) => r.id === roleId);
    if (index === -1) return { success: false, error: 'الدور غير موجود.' };

    if (roles[index].id === 'role_owner') {
      return { success: false, error: 'دور مالك النظام دائم ولا يمكن تعديل صلاحياته الأساسية.' };
    }

    roles[index] = {
      ...roles[index],
      name: roleData.name.trim(),
      description: roleData.description.trim(),
      permissions: roleData.permissions,
    };
    setStored(STORAGE_KEYS.ROLES, roles);

    this.addActivityLog({
      userId: editor.id,
      username: editor.username,
      action: 'تعديل صلاحيات دور',
      module: 'إدارة الأدوار والصلاحيات',
      details: `قام المالك بتحديث صلاحيات الدور (${roles[index].name})`,
    });

    return { success: true };
  },

  deleteRole(editor: User, roleId: string): { success: boolean; error?: string } {
    if (!editor.isOwner) {
      return { success: false, error: 'فقط مالك النظام يمتلك صلاحية حذف الأدوار.' };
    }
    const roles = this.getRoles();
    const target = roles.find((r) => r.id === roleId);
    if (!target) return { success: false, error: 'الدور غير موجود.' };
    if (target.isSystem || target.id === 'role_owner') {
      return { success: false, error: 'لا يمكن حذف الأدوار النظامية الأساسية.' };
    }

    const updated = roles.filter((r) => r.id !== roleId);
    setStored(STORAGE_KEYS.ROLES, updated);

    this.addActivityLog({
      userId: editor.id,
      username: editor.username,
      action: 'حذف دور نظامي',
      module: 'إدارة الأدوار والصلاحيات',
      details: `قام المالك بحذف الدور (${target.name})`,
    });

    return { success: true };
  },

  // Users & Setup
  getUsers(): User[] {
    const raw = getStored<User[]>(STORAGE_KEYS.USERS, []);
    // Strict Sanitization: Remove any demo / sample users (admin, admin123456, demo, test, ahmed, etc.)
    const cleansed = raw.filter((u) => {
      const un = (u.username || '').toLowerCase().trim();
      const id = (u.id || '').toLowerCase().trim();
      return (
        un !== 'admin' &&
        un !== 'admin123456' &&
        un !== 'demo' &&
        un !== 'test' &&
        un !== 'user' &&
        un !== 'ahmed' &&
        id !== 'user_staff_ahmed' &&
        id !== 'demo_user'
      );
    });

    // Enforce owner permanent identity
    const ownerIndex = cleansed.findIndex((u) => u.isOwner === true || u.fullName === 'محمد عبد الغني');
    if (ownerIndex !== -1) {
      cleansed[ownerIndex].fullName = 'محمد عبد الغني';
      cleansed[ownerIndex].role = '👑 System Owner';
      cleansed[ownerIndex].isOwner = true;
      cleansed[ownerIndex].isActive = true; // Cannot be disabled
      cleansed[ownerIndex].permissions = SYSTEM_PERMISSIONS.map((p) => p.id); // Full access
    }

    if (cleansed.length !== raw.length) {
      setStored(STORAGE_KEYS.USERS, cleansed);
    }
    return cleansed;
  },

  hasOwner(): boolean {
    const users = this.getUsers();
    return users.some((u) => u.isOwner === true);
  },

  getOwner(): User | undefined {
    const users = this.getUsers();
    return users.find((u) => u.isOwner === true);
  },

  createOwnerAccount(data: {
    fullName: string;
    username: string;
    password: string;
    email: string;
  }): { success: boolean; user?: User; error?: string } {
    if (this.hasOwner()) {
      return { success: false, error: 'تم إعداد مالك النظام مسبقاً ولا يمكن تكرار الإعداد.' };
    }

    if (!data.username.trim() || !data.password || !data.email.trim()) {
      return { success: false, error: 'جميع الحقول مطلوبة لإعداد حساب المالك.' };
    }

    const cleanUsername = data.username.trim();
    if (cleanUsername.length < 3) {
      return { success: false, error: 'اسم المستخدم يجب ألا يقل عن 3 أحرف أو أرقام.' };
    }

    if (data.password.length < 6) {
      return { success: false, error: 'كلمة المرور يجب ألا تقل عن 6 خانات.' };
    }

    // Hash password with bcrypt and 10 rounds of cryptographic salt
    const hashed = hashPassword(data.password);

    const newOwner: User = {
      id: 'owner_' + Date.now(),
      fullName: 'محمد عبد الغني', // Permanent System Owner
      username: cleanUsername,
      email: data.email.trim(),
      passwordHash: hashed,
      role: '👑 System Owner',
      isActive: true, // Cannot be suspended
      createdAt: new Date().toISOString(),
      isOwner: true, // Permanent Owner Flag
      permissions: SYSTEM_PERMISSIONS.map((p) => p.id),
    };

    const users = [newOwner];
    setStored(STORAGE_KEYS.USERS, users);

    // Track creation
    this.addActivityLog({
      userId: newOwner.id,
      username: newOwner.username,
      action: 'إعداد حساب المالك',
      module: 'الأمان وإعدادات النظام',
      details: `تم إنشاء حساب مالك النظام الدائم (${newOwner.fullName}) باسم المستخدم (${newOwner.username}) بنجاح`,
    });

    return { success: true, user: newOwner };
  },

  // Owner user management operations - STRICTLY Owner Only
  createUser(
    creator: User,
    data: {
      fullName: string;
      username: string;
      password: string;
      email: string;
      phone?: string;
      department?: string;
      jobTitle?: string;
      role: string;
      permissions?: string[];
    }
  ): { success: boolean; user?: User; error?: string } {
    if (!creator.isOwner) {
      return { success: false, error: 'فقط مالك النظام (محمد عبد الغني) يمتلك صلاحية إنشاء مستخدمين.' };
    }

    if (!data.fullName.trim() || !data.username.trim() || !data.password || !data.email.trim()) {
      return { success: false, error: 'يرجى إكمال جميع الحقول الإلزامية يدويًا.' };
    }

    const cleanUsername = data.username.trim();
    if (cleanUsername.toLowerCase() === 'admin') {
      return { success: false, error: 'اسم المستخدم "admin" غير مسموح به في النظام.' };
    }

    const users = this.getUsers();
    if (users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return { success: false, error: 'اسم المستخدم مسجل بالفعل، يرجى اختيار اسم مستخدم آخر يدويًا.' };
    }

    // Secure bcrypt hash with adaptive cost factor
    const hashed = hashPassword(data.password);

    const newUser: User = {
      id: 'user_' + Date.now(),
      fullName: data.fullName.trim(),
      username: cleanUsername,
      email: data.email.trim(),
      phone: data.phone?.trim() || undefined,
      department: data.department?.trim() || undefined,
      jobTitle: data.jobTitle?.trim() || undefined,
      passwordHash: hashed,
      role: data.role,
      isActive: true, // Default active
      createdAt: new Date().toISOString(),
      isOwner: false,
      permissions: data.permissions || [],
    };

    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);

    // Track User Creation
    this.addActivityLog({
      userId: creator.id,
      username: creator.username,
      action: 'إنشاء مستخدم',
      module: 'إدارة المستخدمين',
      details: `قام المالك بإنشاء حساب المستخدم (${newUser.fullName}) باسم دخول (${newUser.username}) ودور (${newUser.role})`,
    });

    return { success: true, user: newUser };
  },

  updateUser(
    editor: User,
    userId: string,
    updates: Partial<Pick<User, 'fullName' | 'email' | 'phone' | 'department' | 'jobTitle' | 'role' | 'isActive' | 'permissions'>>
  ): { success: boolean; error?: string } {
    if (!editor.isOwner) {
      return { success: false, error: 'فقط مالك النظام يمتلك صلاحية تعديل المستخدمين.' };
    }

    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return { success: false, error: 'المستخدم غير موجود.' };

    const targetUser = users[index];
    if (targetUser.isOwner && updates.isActive === false) {
      return { success: false, error: 'لا يمكن إيقاف حساب مالك النظام نهائياً.' };
    }

    const isStatusChanged = updates.isActive !== undefined && updates.isActive !== targetUser.isActive;
    const isRoleChanged = updates.role !== undefined && updates.role !== targetUser.role;
    const isPermChanged = updates.permissions !== undefined;

    users[index] = { ...targetUser, ...updates };
    setStored(STORAGE_KEYS.USERS, users);

    // Track Specific Action
    if (isStatusChanged) {
      this.addActivityLog({
        userId: editor.id,
        username: editor.username,
        action: updates.isActive ? 'تفعيل مستخدم' : 'إيقاف مستخدم',
        module: 'إدارة المستخدمين',
        details: updates.isActive
          ? `قام المالك بتفعيل حساب المستخدم (${targetUser.fullName})`
          : `قام المالك بإيقاف حساب المستخدم (${targetUser.fullName}) - تم إيقاف الحساب بواسطة إدارة النظام`,
      });
    } else if (isRoleChanged || isPermChanged) {
      this.addActivityLog({
        userId: editor.id,
        username: editor.username,
        action: 'تغيير الصلاحيات',
        module: 'إدارة المستخدمين',
        details: `قام المالك بتعديل صلاحيات ودور المستخدم (${targetUser.fullName}) إلى (${updates.role || targetUser.role})`,
      });
    } else {
      this.addActivityLog({
        userId: editor.id,
        username: editor.username,
        action: 'تعديل مستخدم',
        module: 'إدارة المستخدمين',
        details: `قام المالك بتحديث بيانات المستخدم (${targetUser.fullName})`,
      });
    }

    return { success: true };
  },

  deleteUser(editor: User, userId: string): { success: boolean; error?: string } {
    if (!editor.isOwner) {
      return { success: false, error: 'فقط مالك النظام يمتلك صلاحية حذف المستخدمين.' };
    }

    const users = this.getUsers();
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return { success: false, error: 'المستخدم غير موجود.' };

    if (targetUser.isOwner) {
      return { success: false, error: 'حساب مالك النظام (محمد عبد الغني) محمي نهائياً ولا يمكن حذفه قطعيًا.' };
    }

    const updated = users.filter((u) => u.id !== userId);
    setStored(STORAGE_KEYS.USERS, updated);

    // Track User Deletion
    this.addActivityLog({
      userId: editor.id,
      username: editor.username,
      action: 'حذف مستخدم',
      module: 'إدارة المستخدمين',
      details: `قام المالك بحذف حساب المستخدم (${targetUser.fullName}) نهائياً من النظام`,
    });

    return { success: true };
  },

  resetPassword(editor: User, userId: string, newPassword: string): { success: boolean; error?: string } {
    if (!editor.isOwner) {
      return { success: false, error: 'فقط مالك النظام يمكنه إعادة تعيين كلمات المرور.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'كلمة المرور يجب ألا تقل عن 6 خانات.' };
    }

    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return { success: false, error: 'المستخدم غير موجود.' };

    // Hash securely
    user.passwordHash = hashPassword(newPassword);
    setStored(STORAGE_KEYS.USERS, users);

    // Track Password Reset
    this.addActivityLog({
      userId: editor.id,
      username: editor.username,
      action: 'إعادة تعيين كلمة المرور',
      module: 'إدارة المستخدمين',
      details: `قام المالك بإعادة تعيين كلمة المرور للمستخدم (${user.fullName}) وتشفيرها بنجاح`,
    });

    return { success: true };
  },

  // Authentication
  login(
    username: string,
    password: string,
    options?: { ownerOnly?: boolean }
  ): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const cleanUsername = username.trim();
    const user = users.find((u) => u.username.toLowerCase() === cleanUsername.toLowerCase());

    const clientInfo = {
      ip: '127.0.0.1 (محلي آمن)',
      device: typeof navigator !== 'undefined' && navigator.userAgent.includes('Mobile') ? 'هاتف محمول' : 'جهاز كمبيوتر مكتبي',
      browser: typeof navigator !== 'undefined' && navigator.userAgent.includes('Chrome') ? 'Google Chrome' : 'متصفح ويب حديث',
    };

    if (!user) {
      this.recordLoginHistory({
        id: 'hist_' + Date.now(),
        userId: 'UNKNOWN',
        username: cleanUsername,
        timestamp: new Date().toISOString(),
        status: 'FAILED',
        reason: 'اسم المستخدم غير مسجل بالنظام',
        ...clientInfo,
      });
      return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' };
    }

    // Owner Login Exclusive Check
    if (options?.ownerOnly && !user.isOwner) {
      this.recordLoginHistory({
        id: 'hist_' + Date.now(),
        userId: user.id,
        username: user.username,
        timestamp: new Date().toISOString(),
        status: 'BLOCKED',
        reason: 'محاولة دخول غير مصرح بها لصفحة المالك',
        ...clientInfo,
      });
      return { success: false, error: 'هذه الصفحة مخصصة لمالك النظام فقط.' };
    }

    // Check Suspended Status
    if (!user.isActive) {
      this.recordLoginHistory({
        id: 'hist_' + Date.now(),
        userId: user.id,
        username: user.username,
        timestamp: new Date().toISOString(),
        status: 'BLOCKED',
        reason: 'تم إيقاف الحساب بواسطة إدارة النظام',
        ...clientInfo,
      });
      return { success: false, error: 'تم إيقاف الحساب بواسطة إدارة النظام.' };
    }

    // Verify Password Hash securely
    if (!verifyPassword(password, user.passwordHash)) {
      this.recordLoginHistory({
        id: 'hist_' + Date.now(),
        userId: user.id,
        username: user.username,
        timestamp: new Date().toISOString(),
        status: 'FAILED',
        reason: 'كلمة المرور غير صحيحة',
        ...clientInfo,
      });
      return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' };
    }

    // Success
    // Transparent migration: Upgrade legacy hash to robust bcrypt hash
    if (!isBcryptHash(user.passwordHash)) {
      user.passwordHash = hashPassword(password);
    }

    user.lastLoginAt = new Date().toISOString();
    user.lastLoginIp = clientInfo.ip;
    user.device = clientInfo.device;
    setStored(STORAGE_KEYS.USERS, users);
    setStored(STORAGE_KEYS.CURRENT_USER, user);

    this.recordLoginHistory({
      id: 'hist_' + Date.now(),
      userId: user.id,
      username: user.username,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      ...clientInfo,
    });

    this.addActivityLog({
      userId: user.id,
      username: user.username,
      action: 'تسجيل دخول ناجح',
      module: 'الأمان والجلسات',
      details: `تم تسجيل الدخول بنجاح من جهاز: ${clientInfo.device}`,
    });

    return { success: true, user };
  },

  loginOwner(username: string, password: string): { success: boolean; user?: User; error?: string } {
    return this.login(username, password, { ownerOnly: true });
  },

  getCurrentUser(): User | null {
    return getStored<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.addActivityLog({
        userId: user.id,
        username: user.username,
        action: 'تسجيل خروج',
        module: 'الأمان والجلسات',
        details: 'تم إنهاء الجلسة وتسجيل الخروج بنجاح',
      });
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // Login History & Activity Logs
  getLoginHistory(): LoginHistory[] {
    return getStored<LoginHistory[]>(STORAGE_KEYS.LOGIN_HISTORY, []);
  },

  recordLoginHistory(entry: LoginHistory): void {
    const history = this.getLoginHistory();
    history.unshift(entry);
    setStored(STORAGE_KEYS.LOGIN_HISTORY, history.slice(0, 100)); // keep last 100
  },

  getActivityLogs(): ActivityLog[] {
    return getStored<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, []);
  },

  addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    const logs = this.getActivityLogs();
    const entry: ActivityLog = {
      ...log,
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1',
    };
    logs.unshift(entry);
    setStored(STORAGE_KEYS.ACTIVITY_LOGS, logs.slice(0, 200));
  },

  // Accounts & Chart of Accounts
  getAccounts(): Account[] {
    const accounts = getStored<Account[]>(STORAGE_KEYS.ACCOUNTS, []);
    if (accounts.length === 0) {
      setStored(STORAGE_KEYS.ACCOUNTS, STANDARD_EGYPTIAN_CHART);
      return STANDARD_EGYPTIAN_CHART;
    }
    return accounts;
  },

  addAccount(account: Omit<Account, 'id' | 'balance'>): Account {
    const accounts = this.getAccounts();
    const newAcc: Account = {
      ...account,
      id: 'acc_' + Date.now(),
      balance: 0,
    };
    accounts.push(newAcc);
    setStored(STORAGE_KEYS.ACCOUNTS, accounts);
    return newAcc;
  },

  // Journal Entries
  getJournalEntries(): JournalEntry[] {
    return getStored<JournalEntry[]>(STORAGE_KEYS.JOURNAL_ENTRIES, []);
  },

  addJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>): { success: boolean; entry?: JournalEntry; error?: string } {
    if (Math.abs(entry.totalDebit - entry.totalCredit) > 0.001) {
      return { success: false, error: 'القيد المحاسبي غير متوازن! يجب أن يتساوى إجمالي المدين مع إجمالي الدائن.' };
    }

    if (entry.lines.length < 2) {
      return { success: false, error: 'يجب أن يحتوي القيد على طرفين على الأقل (طرف مدين وطرف دائن).' };
    }

    const entries = this.getJournalEntries();
    const newEntry: JournalEntry = {
      ...entry,
      id: 'je_' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    entries.unshift(newEntry);
    setStored(STORAGE_KEYS.JOURNAL_ENTRIES, entries);

    // Update account balances
    const accounts = this.getAccounts();
    for (const line of entry.lines) {
      const acc = accounts.find((a) => a.id === line.accountId || a.code === line.accountCode);
      if (acc) {
        if (acc.type === 'Asset' || acc.type === 'Expense') {
          acc.balance += (line.debit - line.credit);
        } else {
          acc.balance += (line.credit - line.debit);
        }
      }
    }
    setStored(STORAGE_KEYS.ACCOUNTS, accounts);

    return { success: true, entry: newEntry };
  },

  // Partners (Customers & Vendors)
  getPartners(): Partner[] {
    return getStored<Partner[]>(STORAGE_KEYS.PARTNERS, []);
  },

  addPartner(partner: Omit<Partner, 'id' | 'balance' | 'createdAt'>): Partner {
    const partners = this.getPartners();
    const newPartner: Partner = {
      ...partner,
      id: 'part_' + Date.now(),
      balance: 0,
      createdAt: new Date().toISOString(),
    };
    partners.push(newPartner);
    setStored(STORAGE_KEYS.PARTNERS, partners);
    return newPartner;
  },

  deletePartner(id: string): void {
    const partners = this.getPartners().filter((p) => p.id !== id);
    setStored(STORAGE_KEYS.PARTNERS, partners);
  },

  // Inventory
  getInventory(): InventoryItem[] {
    return getStored<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
  },

  addInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt'>): InventoryItem {
    const items = this.getInventory();
    const newItem: InventoryItem = {
      ...item,
      id: 'inv_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    setStored(STORAGE_KEYS.INVENTORY, items);
    return newItem;
  },

  // Fixed Assets
  getFixedAssets(): FixedAsset[] {
    return getStored<FixedAsset[]>(STORAGE_KEYS.FIXED_ASSETS, []);
  },

  addFixedAsset(asset: Omit<FixedAsset, 'id'>): FixedAsset {
    const assets = this.getFixedAssets();
    const newAsset: FixedAsset = {
      ...asset,
      id: 'fa_' + Date.now(),
    };
    assets.push(newAsset);
    setStored(STORAGE_KEYS.FIXED_ASSETS, assets);
    return newAsset;
  },

  // Audit Papers
  getAuditPapers(): AuditWorkingPaper[] {
    return getStored<AuditWorkingPaper[]>(STORAGE_KEYS.AUDIT_PAPERS, []);
  },

  addAuditPaper(paper: Omit<AuditWorkingPaper, 'id'>): AuditWorkingPaper {
    const papers = this.getAuditPapers();
    const newPaper: AuditWorkingPaper = {
      ...paper,
      id: 'aud_' + Date.now(),
    };
    papers.push(newPaper);
    setStored(STORAGE_KEYS.AUDIT_PAPERS, papers);
    return newPaper;
  },

  // Tax Declarations
  getTaxDeclarations(): TaxDeclaration[] {
    return getStored<TaxDeclaration[]>(STORAGE_KEYS.TAX_DECLARATIONS, []);
  },

  addTaxDeclaration(declaration: Omit<TaxDeclaration, 'id'>): TaxDeclaration {
    const decs = this.getTaxDeclarations();
    const newDec: TaxDeclaration = {
      ...declaration,
      id: 'tax_' + Date.now(),
    };
    decs.push(newDec);
    setStored(STORAGE_KEYS.TAX_DECLARATIONS, decs);
    return newDec;
  },

  // Documents
  getDocuments(): UploadedDocument[] {
    return getStored<UploadedDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
  },

  addDocument(doc: Omit<UploadedDocument, 'id' | 'uploadedAt'>): UploadedDocument {
    const docs = this.getDocuments();
    const newDoc: UploadedDocument = {
      ...doc,
      id: 'doc_' + Date.now(),
      uploadedAt: new Date().toISOString(),
    };
    docs.unshift(newDoc);
    setStored(STORAGE_KEYS.DOCUMENTS, docs);
    return newDoc;
  },

  // Notifications
  getNotifications(): SystemNotification[] {
    return getStored<SystemNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  },

  addNotification(notif: Omit<SystemNotification, 'id' | 'timestamp' | 'isRead'>): void {
    const notifs = this.getNotifications();
    notifs.unshift({
      ...notif,
      id: 'notif_' + Date.now(),
      timestamp: new Date().toISOString(),
      isRead: false,
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs.slice(0, 50));
  },

  markNotificationsRead(): void {
    const notifs = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },

  // Chats
  getChats(): ChatMessage[] {
    return getStored<ChatMessage[]>(STORAGE_KEYS.CHATS, []);
  },

  addChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const chats = this.getChats();
    const newMsg: ChatMessage = {
      ...msg,
      id: 'chat_' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    chats.push(newMsg);
    setStored(STORAGE_KEYS.CHATS, chats);
    return newMsg;
  },
};
