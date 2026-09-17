import React from 'react';
import { Database, PlusCircle, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'لا توجد بيانات كافية',
  message = 'النظام يعمل فقط بالسجلات الفعلية والمستندات المدخلة بدون أي بيانات وهمية. يرجى إدخال البيانات المطلوبة لبدء العرض والتحليل.',
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-slate-200/80 shadow-xs my-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0A4DA3] flex items-center justify-center mb-4">
        {icon || <Database className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        {message}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors duration-150"
        >
          <PlusCircle className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};
