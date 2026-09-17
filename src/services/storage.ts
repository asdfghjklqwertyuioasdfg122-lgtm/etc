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
} from '../types';

const STORAGE_KEYS = {
  USERS: 'etc_erp_users_v2',
  CURRENT_USER: 'etc_erp_current_user_v2',
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
  // Users & Setup
  getUsers(): User[] {
    return getStored<User[]>(STORAGE_KEYS.USERS, []);
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
      return { success: false, error: 'تم إعداد مالك النظام مسبقاً.' };
    }

    if (!data.username.trim() || !data.password.trim() || !data.fullName.trim()) {
      return { success: false, error: 'جميع الحقول مطلوبة.' };
    }

    const newOwner: User = {
      id: 'owner_' + Date.now(),
      fullName: data.fullName.trim(),
      username: data.username.trim(),
      email: data.email.trim(),
      passwordHash: btoa(data.password), // standard reversible simulation for zero-backend
      role: 'Owner',
      isActive: true,
      createdAt: new Date().toISOString(),
      isOwner: true,
    };

    const users = [newOwner];
    setStored(STORAGE_KEYS.USERS, users);

    // Log Activity
    this.addActivityLog({
      userId: newOwner.id,
      username: newOwner.username,
      action: 'إعداد مالك النظام',
      module: 'الأمان وإعدادات النظام',
      details: `تم إنشاء حساب مالك النظام الرئيسي (${newOwner.fullName}) بنجاح لأول مرة`,
    });

    return { success: true, user: newOwner };
  },

  // Owner user management operations
  createUser(
    creator: User,
    data: {
      fullName: string;
      username: string;
      password: string;
      email: string;
      role: User['role'];
    }
  ): { success: boolean; user?: User; error?: string } {
    if (!creator.isOwner) {
      return { success: false, error: 'فقط مالك النظام يمتلك صلاحية إنشاء مستخدمين جدد.' };
    }

    const users = this.getUsers();
    if (users.some((u) => u.username.toLowerCase() === data.username.toLowerCase().trim())) {
      return { success: false, error: 'اسم المستخدم مسجل بالفعل.' };
    }

    const newUser: User = {
      id: 'user_' + Date.now(),
      fullName: data.fullName.trim(),
      username: data.username.trim(),
      email: data.email.trim(),
      passwordHash: btoa(data.password),
      role: data.role,
      isActive: true,
      createdAt: new Date().toISOString(),
      isOwner: false,
    };

    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);

    this.addActivityLog({
      userId: creator.id,
      username: creator.username,
      action: 'إضافة مستخدم جديد',
      module: 'إدارة المستخدمين',
      details: `قام المالك بإضافة المستخدم (${newUser.fullName}) برتبة (${newUser.role})`,
    });

    return { success: true, user: newUser };
  },

  updateUser(
    editor: User,
    userId: string,
    updates: Partial<Pick<User, 'fullName' | 'email' | 'role' | 'isActive'>>
  ): { success: boolean; error?: string } {
    if (!editor.isOwner) {
      return { success: false, error: 'فقط مالك النظام يمتلك صلاحية تعديل المستخدمين.' };
    }

    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return { success: false, error: 'المستخدم غير موجود.' };

    const targetUser = users[index];
    if (targetUser.isOwner && updates.isActive === false) {
      return { success: false, error: 'لا يمكن تعطيل حساب مالك النظام نهائياً.' };
    }

    users[index] = { ...targetUser, ...updates };
    setStored(STORAGE_KEYS.USERS, users);

    this.addActivityLog({
      userId: editor.id,
      username: editor.username,
      action: 'تعديل بيانات مستخدم',
      module: 'إدارة المستخدمين',
      details: `تم تحديث بيانات المستخدم (${targetUser.fullName})`,
    });

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
      return { success: false, error: 'حساب مالك النظام محمي ولا يمكن حذفه قطعيًا.' };
    }

    const updated = users.filter((u) => u.id !== userId);
    setStored(STORAGE_KEYS.USERS, updated);

    this.addActivityLog({
      userId: editor.id,
      username: editor.username,
      action: 'حذف مستخدم',
      module: 'إدارة المستخدمين',
      details: `قام المالك بحذف حساب المستخدم (${targetUser.fullName})`,
    });

    return { success: true };
  },

  resetPassword(editor: User, userId: string, newPassword: string): { success: boolean; error?: string } {
    if (!editor.isOwner) {
      return { success: false, error: 'فقط مالك النظام يمكنه إعادة تعيين كلمات المرور.' };
    }

    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return { success: false, error: 'المستخدم غير موجود.' };

    user.passwordHash = btoa(newPassword);
    setStored(STORAGE_KEYS.USERS, users);

    this.addActivityLog({
      userId: editor.id,
      username: editor.username,
      action: 'إعادة تعيين كلمة المرور',
      module: 'إدارة المستخدمين',
      details: `قام المالك بإعادة تعيين كلمة المرور للمستخدم (${user.fullName})`,
    });

    return { success: true };
  },

  // Authentication
  login(username: string, password: string): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const cleanUsername = username.trim();
    const user = users.find((u) => u.username.toLowerCase() === cleanUsername.toLowerCase());

    const clientInfo = {
      ip: '127.0.0.1 (محلي آمن)',
      device: navigator.userAgent.includes('Mobile') ? 'هاتف محمول' : 'جهاز كمبيوتر مكتبي',
      browser: navigator.userAgent.includes('Chrome') ? 'Google Chrome' : 'متصفح ويب حديث',
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

    if (!user.isActive) {
      this.recordLoginHistory({
        id: 'hist_' + Date.now(),
        userId: user.id,
        username: user.username,
        timestamp: new Date().toISOString(),
        status: 'BLOCKED',
        reason: 'الحساب معطل من قبل مالك النظام',
        ...clientInfo,
      });
      return { success: false, error: 'هذا الحساب تم تعطيله من قِبل مالك النظام.' };
    }

    if (user.passwordHash !== btoa(password)) {
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
