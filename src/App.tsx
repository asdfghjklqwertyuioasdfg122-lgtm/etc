import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { User } from './types';
import { OwnerSetupWizard } from './components/auth/OwnerSetupWizard';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveModule } from './components/layout/Sidebar';

// ERP Modules
import { DashboardModule } from './components/modules/DashboardModule';
import { AccountingModule } from './components/modules/AccountingModule';
import { FinancialStatementsModule } from './components/modules/FinancialStatementsModule';
import { CommercialModule } from './components/modules/CommercialModule';
import { TaxModule } from './components/modules/TaxModule';
import { AuditModule } from './components/modules/AuditModule';
import { FinancialAnalysisModule } from './components/modules/FinancialAnalysisModule';
import { EtcAIAssistantModule } from './components/modules/EtcAIAssistantModule';
import { FileAnalyzerModule } from './components/modules/FileAnalyzerModule';
import { AcademyModule } from './components/modules/AcademyModule';
import { UserManagementModule } from './components/modules/UserManagementModule';

export default function App() {
  const [hasOwner, setHasOwner] = useState<boolean>(StorageService.hasOwner());
  const [currentUser, setCurrentUser] = useState<User | null>(StorageService.getCurrentUser());
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    // Sync state in case storage was updated
    setHasOwner(StorageService.hasOwner());
    setCurrentUser(StorageService.getCurrentUser());
  }, []);

  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
  };

  // Case 1: First time run - Show Owner Setup Wizard
  if (!hasOwner) {
    return (
      <OwnerSetupWizard
        onOwnerCreated={(newOwner) => {
          setHasOwner(true);
          setCurrentUser(newOwner);
        }}
        onComplete={(newOwner) => {
          setHasOwner(true);
          setCurrentUser(newOwner);
        }}
      />
    );
  }

  // Case 2: Owner exists but user is not logged in - Show Login Page (Blank, No quick login)
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(loggedInUser) => {
          setCurrentUser(loggedInUser);
        }}
      />
    );
  }

  // Case 3: Authenticated ERP System
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 antialiased" dir="rtl">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={(mod) => {
            setActiveModule(mod);
            setSidebarOpen(false);
          }}
          currentUser={currentUser}
          isOwner={currentUser.role === 'Owner' || currentUser.isOwner}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Dynamic Module Content View */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeModule === 'dashboard' && (
              <DashboardModule currentUser={currentUser} onNavigate={setActiveModule} />
            )}

            {activeModule === 'accounting' && (
              <AccountingModule currentUser={currentUser} />
            )}

            {activeModule === 'financial-statements' && (
              <FinancialStatementsModule
                currentUser={currentUser}
                onNavigateToEntries={() => setActiveModule('accounting')}
              />
            )}

            {activeModule === 'commercial' && (
              <CommercialModule currentUser={currentUser} />
            )}

            {activeModule === 'tax' && (
              <TaxModule currentUser={currentUser} />
            )}

            {activeModule === 'audit' && (
              <AuditModule currentUser={currentUser} />
            )}

            {activeModule === 'financial-analysis' && (
              <FinancialAnalysisModule
                currentUser={currentUser}
                onNavigateToEntries={() => setActiveModule('accounting')}
              />
            )}

            {activeModule === 'ai-assistant' && (
              <EtcAIAssistantModule currentUser={currentUser} />
            )}

            {activeModule === 'file-analyzer' && (
              <FileAnalyzerModule
                currentUser={currentUser}
                onNavigateToEntries={() => setActiveModule('accounting')}
              />
            )}

            {activeModule === 'academy' && (
              <AcademyModule currentUser={currentUser} />
            )}

            {activeModule === 'user-management' && (
              <UserManagementModule currentUser={currentUser} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

