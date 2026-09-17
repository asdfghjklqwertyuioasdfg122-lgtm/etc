import React, { useState } from 'react';
import { User, SystemNotification } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Bell,
  LogOut,
  Shield,
  User as UserIcon,
  Menu,
  Check,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { BluePyramidLogo } from '../common/BluePyramidLogo';

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, onToggleSidebar }) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>(StorageService.getNotifications());
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    StorageService.markNotificationsRead();
    setNotifications(StorageService.getNotifications());
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between shadow-xs lg:mr-64">
      {/* Right side (RTL): Brand and Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (typeof onToggleSidebar === 'function') {
              onToggleSidebar();
            }
          }}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden cursor-pointer"
          title="القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          {/* Blue Pyramid Branding Logo */}
          <BluePyramidLogo size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-[#0A4DA3] text-sm tracking-tight">ETC ERP</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0A4DA3] border border-blue-200">
                منصة ETC الذكية
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              للمحاسبة والمراجعة والضرائب وإدارة الأعمال
            </p>
          </div>
        </div>
      </div>

      {/* Left side (RTL): User profile, Notifications, Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors"
            title="الإشعارات"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute left-0 sm:right-auto sm:left-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">مركز الإشعارات</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-[#0A4DA3] hover:underline font-semibold"
                  >
                    تحديد الكل كمقروء
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    لا توجد إشعارات جديدة حالياً
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5 ${
                        !notif.isRead ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {notif.type === 'ALERT' && (
                        <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      )}
                      {notif.type === 'SUCCESS' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      )}
                      {notif.type === 'INFO' && (
                        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-800">{notif.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {notif.message}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          {new Date(notif.timestamp).toLocaleTimeString('ar-EG')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-r border-slate-200/80 pr-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0A4DA3]">
            {currentUser.isOwner ? (
              <Shield className="w-4 h-4 text-amber-600" />
            ) : (
              <UserIcon className="w-4 h-4" />
            )}
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>{currentUser.fullName}</span>
              {currentUser.isOwner && (
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[10px] font-bold rounded">
                  مالك النظام
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              @{currentUser.username}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-rose-200"
          title="تسجيل الخروج"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">خروج</span>
        </button>
      </div>
    </header>
  );
};
