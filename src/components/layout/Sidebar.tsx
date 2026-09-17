import React from 'react';
import { User } from '../../types';
import {
  LayoutDashboard,
  BookOpen,
  FileSpreadsheet,
  Users,
  Building2,
  Receipt,
  FileCheck2,
  LineChart,
  FileSearch,
  Bot,
  Mic,
  GraduationCap,
  Scale,
  ShieldCheck,
  History,
  MessageSquare,
  ChevronLeft,
  X,
} from 'lucide-react';
import { BluePyramidLogo } from '../common/BluePyramidLogo';

export type ActiveModule =
  | 'dashboard'
  | 'accounting'
  | 'commercial'
  | 'financial-statements'
  | 'tax'
  | 'audit'
  | 'financial-analysis'
  | 'file-analyzer'
  | 'ai-assistant'
  | 'voice-mentor'
  | 'academy'
  | 'regulations'
  | 'user-management'
  | 'activity-logs'
  | 'communication';

interface SidebarProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  currentUser?: User;
  isOwner?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  currentUser,
  isOwner,
  isOpen = false,
  onClose,
}) => {
  const isUserOwner = isOwner ?? (currentUser?.isOwner || currentUser?.role === 'Owner');
  const menuGroups = [
    {
      groupTitle: 'الرئيسية والمؤشرات',
      items: [
        { id: 'dashboard' as ActiveModule, label: 'لوحة المؤشرات العامة', icon: LayoutDashboard },
      ],
    },
    {
      groupTitle: 'المحاسبة والتقارير المالية',
      items: [
        { id: 'accounting' as ActiveModule, label: 'النظام المحاسبي والقيود', icon: BookOpen },
        { id: 'financial-statements' as ActiveModule, label: 'القوائم المالية والختامية', icon: FileSpreadsheet },
        { id: 'commercial' as ActiveModule, label: 'العملاء والموردون والمخزون', icon: Building2 },
      ],
    },
    {
      groupTitle: 'الضرائب والمراجعة والتحليل',
      items: [
        { id: 'tax' as ActiveModule, label: 'منظومة الضرائب المصرية', icon: Receipt },
        { id: 'audit' as ActiveModule, label: 'المراجعة والتدقيق والرقابة', icon: FileCheck2 },
        { id: 'financial-analysis' as ActiveModule, label: 'التحليل المالي والـ KPIs', icon: LineChart },
      ],
    },
    {
      groupTitle: 'الذكاء الاصطناعي والتعليم',
      items: [
        { id: 'file-analyzer' as ActiveModule, label: 'محلل الملفات والمستندات', icon: FileSearch },
        { id: 'ai-assistant' as ActiveModule, label: 'مستشار ETC AI الذكي', icon: Bot },
        { id: 'voice-mentor' as ActiveModule, label: 'أستاذ ETC الصوتي', icon: Mic },
        { id: 'academy' as ActiveModule, label: 'أكاديمية ETC والشهادات', icon: GraduationCap },
        { id: 'regulations' as ActiveModule, label: 'مركز القوانين والتشريعات', icon: Scale },
      ],
    },
    {
      groupTitle: 'الإدارة والرقابة',
      items: [
        {
          id: 'user-management' as ActiveModule,
          label: '👥 إدارة المستخدمين',
          icon: ShieldCheck,
          badge: isUserOwner ? 'خاص بالمالك' : undefined,
        },
        { id: 'activity-logs' as ActiveModule, label: 'سجل النشاطات الرقابي', icon: History },
        { id: 'communication' as ActiveModule, label: 'المراسلات والتعاميم', icon: MessageSquare },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Dark Blue Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-40 w-64 bg-gradient-to-b from-[#061C3D] via-[#0A2D64] to-[#082247] text-white border-l border-white/10 flex flex-col transition-transform duration-200 lg:translate-x-0 shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top Header with Pyramid Logo */}
        <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between bg-black/15">
          <div className="flex items-center gap-3">
            <BluePyramidLogo size="sm" animate />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-base tracking-tight">ETC</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-[#2F80ED] text-white rounded font-bold">
                  ERP
                </span>
              </div>
              <p className="text-[10px] text-blue-200/90 font-medium leading-none mt-0.5">
                منصة ETC الذكية
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Menu Groups */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-blue-200/60 uppercase tracking-wider mb-2">
                {group.groupTitle}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectModule(item.id);
                      if (window.innerWidth < 1024 && typeof onClose === 'function') {
                        onClose();
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-[#2F80ED] text-white shadow-lg shadow-blue-500/30 font-bold translate-x-[-2px]'
                        : 'text-white/85 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-white/80'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-amber-400 text-slate-900 shadow-xs'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* System info footer */}
        <div className="p-3 border-t border-white/10 bg-black/20 text-[11px] text-blue-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span className="text-white/90 text-[11px]">النظام المالي نشط</span>
          </div>
          <span className="font-mono text-[10px] text-blue-200/60">EAS v2.5</span>
        </div>
      </aside>
    </>
  );
};
