/**
 * ETC ERP Platform Types
 * منصة ETC الذكية للمحاسبة والمراجعة والضرائب وإدارة الأعمال
 */

export type UserRole = 'Owner' | 'Admin' | 'ChiefAccountant' | 'Auditor' | 'TaxConsultant' | 'Accountant' | 'Viewer';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  passwordHash: string; // Stored securely
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  device?: string;
  isOwner?: boolean;
}

export interface LoginHistory {
  id: string;
  userId: string;
  username: string;
  timestamp: string;
  ip: string;
  device: string;
  browser: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  reason?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ip?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  startedAt: string;
  lastActiveAt: string;
  ip: string;
  device: string;
  browser: string;
}

// Chart of Accounts
export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export interface Account {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  type: AccountType;
  parentId?: string;
  level: number;
  balance: number;
  description?: string;
  isActive: boolean;
}

// Journal Entry
export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  costCenterId?: string;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  reference?: string;
  description: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  isPosted: boolean;
  createdBy: string;
  createdAt: string;
  attachments?: string[];
}

// Customers & Vendors
export interface Partner {
  id: string;
  type: 'Customer' | 'Vendor';
  code: string;
  name: string;
  taxRegistrationNumber?: string;
  commercialRegister?: string;
  phone?: string;
  email?: string;
  address?: string;
  balance: number;
  createdAt: string;
}

// Inventory Item
export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  quantityOnHand: number;
  averageCost: number;
  sellingPrice: number;
  reorderLevel: number;
  createdAt: string;
}

// Cost Center
export interface CostCenter {
  id: string;
  code: string;
  name: string;
  parentId?: string;
}

// Fixed Asset
export interface FixedAsset {
  id: string;
  code: string;
  name: string;
  purchaseDate: string;
  purchaseCost: number;
  salvageValue: number;
  usefulLifeYears: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  depreciationMethod: 'StraightLine' | 'DecliningBalance';
}

// Audit Working Paper
export interface AuditWorkingPaper {
  id: string;
  referenceNo: string;
  title: string;
  auditArea: string;
  preparedBy: string;
  reviewedBy?: string;
  date: string;
  status: 'In_Progress' | 'Reviewed' | 'Completed';
  findings: string;
  recommendations: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

// Tax Declaration / Record
export interface TaxDeclaration {
  id: string;
  taxType: 'IncomeTax' | 'VAT' | 'PayrollTax' | 'WithholdingTax';
  period: string;
  year: number;
  taxableAmount: number;
  taxDue: number;
  submissionDate?: string;
  status: 'Draft' | 'Submitted' | 'Paid';
  notes?: string;
}

// Notification
export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

// Internal Chat Message
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId?: string; // empty means public / general announcement
  message: string;
  timestamp: string;
  isAnnouncement?: boolean;
}

// Uploaded Document
export interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
  summary?: string;
  extractedData?: any;
}
