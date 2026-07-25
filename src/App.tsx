import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, AdminTab } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { CollegeManager } from './components/CollegeManager';
import { LevelManager } from './components/LevelManager';
import { CourseManager } from './components/CourseManager';
import { LectureManager } from './components/LectureManager';
import { FileManager } from './components/FileManager';
import { TelegramSettingsManager } from './components/TelegramSettingsManager';
import { PublicLibraryView } from './components/PublicLibraryView';
import { LoginForm } from './components/LoginForm';
import { User, DashboardStats } from './types';
import { api } from './services/api';

export default function App() {
  const [activeView, setActiveView] = useState<'public' | 'admin'>('public');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('overview');
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    collegesCount: 0,
    levelsCount: 0,
    coursesCount: 0,
    lecturesCount: 0,
    filesCount: 0,
  });

  const fetchStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    // Check local storage for existing session
    const currentUser = api.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    fetchStats();
  }, []);

  const handleLoginSuccess = (loggedUser: User) => {
    setUser(loggedUser);
    setIsLoginOpen(false);
    setActiveView('admin');
    fetchStats();
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setActiveView('public');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased dir-rtl selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        user={user}
        activeView={activeView}
        setActiveView={(view) => {
          if (view === 'admin' && !user) {
            setIsLoginOpen(true);
          } else {
            setActiveView(view);
          }
        }}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'public' ? (
          <PublicLibraryView />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Admin Sidebar */}
            <Sidebar
              activeTab={activeAdminTab}
              setActiveTab={setActiveAdminTab}
              stats={stats}
            />

            {/* Admin Content Panels */}
            <div className="flex-1 min-w-0">
              {activeAdminTab === 'overview' && (
                <DashboardOverview stats={stats} setActiveTab={setActiveAdminTab} />
              )}
              {activeAdminTab === 'colleges' && (
                <CollegeManager onDataChange={fetchStats} />
              )}
              {activeAdminTab === 'levels' && (
                <LevelManager onDataChange={fetchStats} />
              )}
              {activeAdminTab === 'courses' && (
                <CourseManager onDataChange={fetchStats} />
              )}
              {activeAdminTab === 'lectures' && (
                <LectureManager onDataChange={fetchStats} />
              )}
              {activeAdminTab === 'files' && (
                <FileManager onDataChange={fetchStats} />
              )}
              {activeAdminTab === 'telegram' && (
                <TelegramSettingsManager />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Login Modal */}
      {isLoginOpen && (
        <LoginForm
          onSuccess={handleLoginSuccess}
          onClose={() => setIsLoginOpen(false)}
        />
      )}
    </div>
  );
}
