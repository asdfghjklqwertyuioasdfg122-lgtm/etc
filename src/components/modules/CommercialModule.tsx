import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { User, Partner, InventoryItem } from '../../types';
import {
  Building2,
  Users,
  Package,
  PlusCircle,
  Search,
  Trash2,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  X,
} from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

interface CommercialModuleProps {
  currentUser: User;
}

export const CommercialModule: React.FC<CommercialModuleProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'vendors' | 'inventory'>('customers');
  const [partners, setPartners] = useState<Partner[]>(StorageService.getPartners());
  const [inventory, setInventory] = useState<InventoryItem[]>(StorageService.getInventory());
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // Partner Form
  const [pName, setPName] = useState('');
  const [pTaxId, setPTaxId] = useState('');
  const [pCommercialReg, setPCommercialReg] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pAddress, setPAddress] = useState('');

  // Inventory Form
  const [iCode, setICode] = useState('');
  const [iName, setIName] = useState('');
  const [iCategory, setICategory] = useState('بضاعة عامة');
  const [iUnit, setIUnit] = useState('قطعة');
  const [iQty, setIQty] = useState(0);
  const [iCost, setICost] = useState(0);
  const [iPrice, setIPrice] = useState(0);

  const refreshData = () => {
    setPartners(StorageService.getPartners());
    setInventory(StorageService.getInventory());
  };

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    const partnerType = activeTab === 'customers' ? 'Customer' : 'Vendor';
    const code = (partnerType === 'Customer' ? 'CUST-' : 'VEND-') + (partners.filter((p) => p.type === partnerType).length + 1);

    StorageService.addPartner({
      type: partnerType,
      code,
      name: pName.trim(),
      taxRegistrationNumber: pTaxId.trim(),
      commercialRegister: pCommercialReg.trim(),
      phone: pPhone.trim(),
      email: pEmail.trim(),
      address: pAddress.trim(),
    });

    setIsPartnerModalOpen(false);
    setPName('');
    setPTaxId('');
    setPCommercialReg('');
    setPPhone('');
    setPEmail('');
    setPAddress('');
    refreshData();
  };

  const handleAddInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!iName.trim() || !iCode.trim()) return;

    StorageService.addInventoryItem({
      code: iCode.trim(),
      name: iName.trim(),
      category: iCategory,
      unit: iUnit,
      quantityOnHand: Number(iQty) || 0,
      averageCost: Number(iCost) || 0,
      sellingPrice: Number(iPrice) || 0,
      reorderLevel: 5,
    });

    setIsItemModalOpen(false);
    setICode('');
    setIName('');
    setIQty(0);
    setICost(0);
    setIPrice(0);
    refreshData();
  };

  const handleDeletePartner = (id: string) => {
    StorageService.deletePartner(id);
    refreshData();
  };

  const customersList = partners.filter((p) => p.type === 'Customer');
  const vendorsList = partners.filter((p) => p.type === 'Vendor');

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 text-[#0A4DA3] font-bold text-xl">
            <Building2 className="w-6 h-6" />
            <h2>العملاء، الموردون وإدارة المخزون</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            سجلات تجارية حقيقية برقم التسجيل الضريبي والسجل التجاري وأرصدة التعاملات
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab !== 'inventory' ? (
            <button
              onClick={() => setIsPartnerModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{activeTab === 'customers' ? 'إضافة عميل جديد' : 'إضافة مورد جديد'}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsItemModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة صنف مخزني</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'customers'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          العملاء ({customersList.length})
        </button>

        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'vendors'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          الموردون ({vendorsList.length})
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'inventory'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          المخزون السلعي ({inventory.length})
        </button>
      </div>

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          {customersList.length === 0 ? (
            <EmptyState
              title="لا توجد بيانات كافية - لا يوجد عملاء مسجلين"
              message="النظام لا يعرض أي بيانات أو شركات وهمية. ابدأ بإضافة بيانات العميل الفعلي برقم تسجيله الضريبي."
              actionText="إضافة أول عميل الآن"
              onAction={() => setIsPartnerModalOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">كود العميل</th>
                    <th className="p-3">اسم العميل / الشركة</th>
                    <th className="p-3">رقم التسجيل الضريبي</th>
                    <th className="p-3">الهاتف</th>
                    <th className="p-3">العنوان</th>
                    <th className="p-3 text-left font-mono">الرصيد الفعلي (ج.م)</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customersList.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-mono font-bold text-blue-700">{cust.code}</td>
                      <td className="p-3 font-bold text-slate-900">{cust.name}</td>
                      <td className="p-3 font-mono text-slate-600">{cust.taxRegistrationNumber || '—'}</td>
                      <td className="p-3 text-slate-600">{cust.phone || '—'}</td>
                      <td className="p-3 text-slate-600">{cust.address || '—'}</td>
                      <td className="p-3 text-left font-mono font-bold text-slate-900">
                        {cust.balance.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeletePartner(cust.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Vendors Tab */}
      {activeTab === 'vendors' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          {vendorsList.length === 0 ? (
            <EmptyState
              title="لا توجد بيانات كافية - لا يوجد موردون مسجلين"
              message="لا توجد بيانات موردين مسجلة حتى الآن. يمكنك إضافة الموردين برقم تسجيلهم الضريبي وسجلهم التجاري لربط الفواتير والضرائب."
              actionText="إضافة مورد معتمد"
              onAction={() => setIsPartnerModalOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">كود المورد</th>
                    <th className="p-3">اسم المورد</th>
                    <th className="p-3">رقم التسجيل الضريبي</th>
                    <th className="p-3">السجل التجاري</th>
                    <th className="p-3">الهاتف</th>
                    <th className="p-3 text-left font-mono">الرصيد المستحق (ج.م)</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendorsList.map((vend) => (
                    <tr key={vend.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-mono font-bold text-blue-700">{vend.code}</td>
                      <td className="p-3 font-bold text-slate-900">{vend.name}</td>
                      <td className="p-3 font-mono text-slate-600">{vend.taxRegistrationNumber || '—'}</td>
                      <td className="p-3 font-mono text-slate-600">{vend.commercialRegister || '—'}</td>
                      <td className="p-3 text-slate-600">{vend.phone || '—'}</td>
                      <td className="p-3 text-left font-mono font-bold text-slate-900">
                        {vend.balance.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeletePartner(vend.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          {inventory.length === 0 ? (
            <EmptyState
              title="لا توجد بيانات كافية - المخزون فارغ"
              message="لا توجد أصناف مخزنية مسجلة. يمكنك إدخال أصناف المخزون مع تحديد وحدات القياس، متوسط التكلفة وسعر البيع."
              actionText="إضافة صنف مخزني"
              onAction={() => setIsItemModalOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">كود الصنف</th>
                    <th className="p-3">اسم الصنف</th>
                    <th className="p-3">الفئة</th>
                    <th className="p-3">الوحدة</th>
                    <th className="p-3 font-mono">الكمية المتاحة</th>
                    <th className="p-3 font-mono">متوسط التكلفة (ج.م)</th>
                    <th className="p-3 font-mono">سعر البيع (ج.م)</th>
                    <th className="p-3 text-left font-mono">إجمالي القيمة التقديرية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-mono font-bold text-blue-700">{item.code}</td>
                      <td className="p-3 font-bold text-slate-900">{item.name}</td>
                      <td className="p-3 text-slate-600">{item.category}</td>
                      <td className="p-3 text-slate-600">{item.unit}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{item.quantityOnHand}</td>
                      <td className="p-3 font-mono text-slate-700">
                        {item.averageCost.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 font-mono text-emerald-800 font-bold">
                        {item.sellingPrice.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-left font-mono font-bold text-slate-900">
                        {(item.quantityOnHand * item.averageCost).toLocaleString('ar-EG', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Partner Modal */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-800">
                {activeTab === 'customers' ? 'إضافة عميل جديد' : 'إضافة مورد جديد'}
              </h3>
              <button
                onClick={() => setIsPartnerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الشريك التجاري *</label>
                <input
                  type="text"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="اسم الشركة أو الفرد"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم التسجيل الضريبي</label>
                <input
                  type="text"
                  value={pTaxId}
                  onChange={(e) => setPTaxId(e.target.value)}
                  placeholder="9 أرقام (التسجيل الضريبي المصري)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم السجل التجاري</label>
                <input
                  type="text"
                  value={pCommercialReg}
                  onChange={(e) => setPCommercialReg(e.target.value)}
                  placeholder="رقم القيد بالسجل التجاري"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الهاتف</label>
                  <input
                    type="text"
                    value={pPhone}
                    onChange={(e) => setPPhone(e.target.value)}
                    placeholder="رقم الهاتف"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">البريد</label>
                  <input
                    type="email"
                    value={pEmail}
                    onChange={(e) => setPEmail(e.target.value)}
                    placeholder="البريد الإلكتروني"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">العنوان</label>
                <input
                  type="text"
                  value={pAddress}
                  onChange={(e) => setPAddress(e.target.value)}
                  placeholder="المدينة، المحافظة"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  حفظ الشريك
                </button>
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-800">إضافة صنف مخزني جديد</h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInventory} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">كود الصنف *</label>
                  <input
                    type="text"
                    value={iCode}
                    onChange={(e) => setICode(e.target.value)}
                    placeholder="PRD-001"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وحدة القياس</label>
                  <input
                    type="text"
                    value={iUnit}
                    onChange={(e) => setIUnit(e.target.value)}
                    placeholder="قطعة، كجم، متر..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الصنف *</label>
                <input
                  type="text"
                  value={iName}
                  onChange={(e) => setIName(e.target.value)}
                  placeholder="الوصف التجاري للصنف"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرصيد الافتتاحي</label>
                  <input
                    type="number"
                    value={iQty}
                    onChange={(e) => setIQty(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التكلفة (ج.م)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={iCost}
                    onChange={(e) => setICost(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">سعر البيع</label>
                  <input
                    type="number"
                    step="0.01"
                    value={iPrice}
                    onChange={(e) => setIPrice(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  حفظ الصنف
                </button>
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
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
