'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import {
  LayoutDashboard,
  Link2,
  LayoutTemplate,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Search,
  Bell,
  Home,
  User as UserIcon,
  LogOut,
  HelpCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { QuickCreateModal } from '@/components/dashboard/QuickCreateModal';
import { CreateLinkModal } from '@/components/dashboard/CreateLinkModal';
import { CreateMicrositeModal } from '@/components/dashboard/CreateMicrositeModal';
import { INITIAL_USER } from '@/lib/mockData';
import { getStoredUser, setAuthSession } from '@/lib/storage';
import { getFirebaseAuth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { User } from '@/types';
import { useTheme } from '@/context/ThemeContext';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const { theme, isDark, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User>(INITIAL_USER);

  // Modal triggers
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [showCreateMicrosite, setShowCreateMicrosite] = useState(false);

  const syncUser = () => {
    setUser(getStoredUser());
  };

  useEffect(() => {
    syncUser();
    window.addEventListener('mfy_storage_update', syncUser);
    return () => window.removeEventListener('mfy_storage_update', syncUser);
  }, []);

  // Global Command Palette Shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  const dashboardHref = isAdmin ? '/admin/dashboard' : '/member/dashboard';

  const navItems = [
    {
      id: 'nav-dashboard',
      label: isAdmin ? 'Dashboard Admin' : 'Dashboard',
      href: dashboardHref,
      icon: isAdmin ? ShieldCheck : LayoutDashboard,
    },
    ...(isAdmin
      ? [
          {
            id: 'nav-member-workspace',
            label: 'Workspace Member',
            href: '/member/dashboard',
            icon: LayoutDashboard,
            badge: 'User',
          },
        ]
      : []),
    { id: 'nav-links', label: 'Short Links', href: '/links', icon: Link2 },
    { id: 'nav-microsites', label: 'Microsites', href: '/microsites', icon: LayoutTemplate },
    { id: 'nav-analytics', label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { id: 'nav-settings', label: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('SignOut error:', err);
      }
    }
    setAuthSession(false);
    window.location.href = '/';
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070913] flex flex-col md:flex-row text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* ================= DESKTOP SIDEBAR (PRD Section 25 & 26) ================= */}
      <aside
        className={`hidden md:flex flex-col justify-between border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] transition-all duration-300 z-30 sticky top-0 h-screen ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Top brand header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          {!collapsed ? (
            <BrandLogo size="md" variant="long" href={dashboardHref} theme={isDark ? 'dark' : 'light'} />
          ) : (
            <BrandLogo size="sm" variant="square" href={dashboardHref} theme={isDark ? 'dark' : 'light'} className="mx-auto" />
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:block"
            title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Global Create Button (PRD Section 33) */}
        <div className="p-3">
          <button
            onClick={() => setShowQuickCreate(true)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white font-semibold text-xs shadow-xs hover:opacity-95 transition-all cursor-pointer ${
              collapsed ? 'px-0' : 'px-4'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-white" />
            {!collapsed && <span>Buat Baru</span>}
          </button>
        </div>

        {/* Main Navigation Items */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {!collapsed && (
            <p className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Menu Utama
            </p>
          )}

          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin/dashboard' &&
                item.href !== '/member/dashboard' &&
                pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-[#5B5BF7] dark:text-indigo-400 font-semibold border border-transparent dark:border-indigo-800/40'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#5B5BF7] dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-[#5B5BF7] dark:text-indigo-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom User Profile Section with Role Switcher & Theme Toggle */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="relative">
              <img
                src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user.displayName}
                className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                  isAdmin ? 'bg-indigo-600' : 'bg-emerald-500'
                }`}
                title={isAdmin ? 'Super Admin' : 'Member'}
              />
            </div>
            {!collapsed && (
              <div className="flex-1 truncate">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.displayName}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${
                      isAdmin ? 'bg-indigo-100 dark:bg-indigo-950/80 text-[#5B5BF7] dark:text-indigo-300' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {isAdmin ? '👑 Admin' : '👤 Member'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">@{user.username}</span>
                </div>
              </div>
            )}
          </div>

          {!collapsed ? (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-xs font-medium border border-slate-100 dark:border-slate-800"
                title="Keluar / Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun</span>
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Keluar / Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#0F172A]/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-8 py-3 flex items-center justify-between transition-colors duration-200">
          {/* Search Trigger */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400 w-44 sm:w-64 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Cari link atau halaman...</span>
            <kbd className="hidden sm:inline-block ml-auto px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-800 rounded-sm border border-slate-200 dark:border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Theme Switcher Button (Tampil di Bagian Atas Saja) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
              title={isDark ? 'Beralih ke Mode Terang (Light)' : 'Beralih ke Mode Gelap (Dark)'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-500 transition-transform hover:-rotate-12" />
              )}
              <span className="hidden sm:inline text-[11px] font-medium">
                {isDark ? 'Gelap' : 'Terang'}
              </span>
            </button>

            <Link
              href="https://www.mfytech.my.id"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-2 py-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>MfyTech</span>
            </Link>

            <button
              onClick={() => setShowQuickCreate(true)}
              className="md:hidden flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat</span>
            </button>
          </div>
        </header>

        {/* Page Children Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>

        {/* Application Footer (PRD Section 51) */}
        <footer className="hidden md:block py-6 px-8 border-t-2 border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xs text-center text-xs text-slate-500 dark:text-slate-400 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
            <p>
              <span className="font-semibold text-slate-800 dark:text-white">MfyEvent</span> — Short Link & Microsite Platform by{' '}
              <a
                href="https://www.mfytech.my.id"
                target="_blank"
                rel="noreferrer"
                className="text-[#5B5BF7] hover:underline font-semibold"
              >
                MfyTech
              </a>
            </p>
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px]">
              <Link href="/faqs" className="hover:text-slate-900 dark:hover:text-white transition-colors">FAQS</Link>
              <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privasi</Link>
              <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Ketentuan</Link>
              <a href="https://www.mfytech.my.id" target="_blank" rel="noreferrer" className="hover:text-[#5B5BF7] transition-colors">
                Portal Utama
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* ================= SLEEK ANIMATED MOBILE BOTTOM NAVIGATION ================= */}
      {(() => {
        const activeTabIdx = pathname?.startsWith('/links')
          ? 1
          : pathname?.startsWith('/microsites')
          ? 3
          : pathname?.startsWith('/settings')
          ? 4
          : 0;

        return (
          <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto pointer-events-none">
            <div className="relative bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl rounded-[26px] shadow-[0_12px_36px_-6px_rgba(15,23,42,0.18),0_0_0_1px_rgba(91,91,247,0.18)] dark:shadow-[0_16px_45px_-6px_rgba(0,0,0,0.85),0_0_0_1px_rgba(91,91,247,0.28)] border border-slate-200/90 dark:border-slate-800 ring-1 ring-slate-900/5 dark:ring-white/10 pt-2.5 pb-2 px-1 pointer-events-auto overflow-visible">
              {/* Subtle luminous top accent border line */}
              <div className="absolute -top-[1px] left-8 right-8 h-[1.5px] bg-gradient-to-r from-transparent via-[#5B5BF7]/70 to-transparent pointer-events-none" />

              {/* Ultra-Smooth Animated Elevated Floating Bubble Circle (GPU Accelerated) */}
              <div
                className="absolute -top-5 left-0 w-1/5 flex justify-center pointer-events-none z-20 transition-transform duration-300 ease-[cubic-bezier(0.34,1.25,0.64,1)] will-change-transform"
                style={{
                  transform: `translate3d(${activeTabIdx * 100}%, 0, 0)`,
                }}
              >
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#0F172A] border-[3px] border-[#5B5BF7] shadow-[0_8px_20px_rgba(91,91,247,0.38)] flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-indigo-50/95 dark:bg-indigo-950/95 flex items-center justify-center text-[#5B5BF7] shadow-inner">
                    {activeTabIdx === 0 && <Home className="w-5 h-5 stroke-[2.5] animate-in fade-in zoom-in-75 duration-200" />}
                    {activeTabIdx === 1 && <Link2 className="w-5 h-5 stroke-[2.5] animate-in fade-in zoom-in-75 duration-200" />}
                    {activeTabIdx === 3 && <LayoutTemplate className="w-5 h-5 stroke-[2.5] animate-in fade-in zoom-in-75 duration-200" />}
                    {activeTabIdx === 4 && <UserIcon className="w-5 h-5 stroke-[2.5] animate-in fade-in zoom-in-75 duration-200" />}
                  </div>
                </div>
              </div>

              {/* 5 Tab Columns */}
              <div className="grid grid-cols-5 relative z-10">
                {/* Tab 0: Home */}
                <Link
                  href={dashboardHref}
                  className="flex flex-col items-center justify-end h-11 text-center group cursor-pointer transition-colors"
                >
                  <div
                    className={`transition-all duration-200 ${
                      activeTabIdx === 0
                        ? 'opacity-0 scale-50 -translate-y-1'
                        : 'opacity-70 group-hover:opacity-100 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <Home className="w-5 h-5 mb-0.5" />
                  </div>
                  <span
                    className={`text-[10px] transition-all duration-200 ${
                      activeTabIdx === 0
                        ? 'font-bold text-[#5B5BF7] dark:text-[#818CF8]'
                        : 'font-medium text-slate-400 dark:text-slate-400'
                    }`}
                  >
                    Home
                  </span>
                </Link>

                {/* Tab 1: Links */}
                <Link
                  href="/links"
                  className="flex flex-col items-center justify-end h-11 text-center group cursor-pointer transition-colors"
                >
                  <div
                    className={`transition-all duration-200 ${
                      activeTabIdx === 1
                        ? 'opacity-0 scale-50 -translate-y-1'
                        : 'opacity-70 group-hover:opacity-100 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <Link2 className="w-5 h-5 mb-0.5" />
                  </div>
                  <span
                    className={`text-[10px] transition-all duration-200 ${
                      activeTabIdx === 1
                        ? 'font-bold text-[#5B5BF7] dark:text-[#818CF8]'
                        : 'font-medium text-slate-400 dark:text-slate-400'
                    }`}
                  >
                    Links
                  </span>
                </Link>

                {/* Tab 2: Quick Create Button */}
                <button
                  onClick={() => setShowQuickCreate(true)}
                  className="flex flex-col items-center justify-end h-11 text-center group cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#5B5BF7] to-[#06B6D4] text-white flex items-center justify-center mb-0.5 group-hover:scale-110 active:scale-90 transition-transform shadow-xs">
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                    Buat
                  </span>
                </button>

                {/* Tab 3: Sites */}
                <Link
                  href="/microsites"
                  className="flex flex-col items-center justify-end h-11 text-center group cursor-pointer transition-colors"
                >
                  <div
                    className={`transition-all duration-200 ${
                      activeTabIdx === 3
                        ? 'opacity-0 scale-50 -translate-y-1'
                        : 'opacity-70 group-hover:opacity-100 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <LayoutTemplate className="w-5 h-5 mb-0.5" />
                  </div>
                  <span
                    className={`text-[10px] transition-all duration-200 ${
                      activeTabIdx === 3
                        ? 'font-bold text-[#5B5BF7] dark:text-[#818CF8]'
                        : 'font-medium text-slate-400 dark:text-slate-400'
                    }`}
                  >
                    Sites
                  </span>
                </Link>

                {/* Tab 4: Profile */}
                <Link
                  href="/settings"
                  className="flex flex-col items-center justify-end h-11 text-center group cursor-pointer transition-colors"
                >
                  <div
                    className={`transition-all duration-200 ${
                      activeTabIdx === 4
                        ? 'opacity-0 scale-50 -translate-y-1'
                        : 'opacity-70 group-hover:opacity-100 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <UserIcon className="w-5 h-5 mb-0.5" />
                  </div>
                  <span
                    className={`text-[10px] transition-all duration-200 ${
                      activeTabIdx === 4
                        ? 'font-bold text-[#5B5BF7] dark:text-[#818CF8]'
                        : 'font-medium text-slate-400 dark:text-slate-400'
                    }`}
                  >
                    Profil
                  </span>
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modals */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onOpenCreateLink={() => setShowCreateLink(true)}
        onOpenCreateMicrosite={() => setShowCreateMicrosite(true)}
      />

      <QuickCreateModal
        isOpen={showQuickCreate}
        onClose={() => setShowQuickCreate(false)}
        onSelectShortLink={() => setShowCreateLink(true)}
        onSelectMicrosite={() => setShowCreateMicrosite(true)}
      />

      <CreateLinkModal
        isOpen={showCreateLink}
        onClose={() => setShowCreateLink(false)}
      />

      <CreateMicrositeModal
        isOpen={showCreateMicrosite}
        onClose={() => setShowCreateMicrosite(false)}
      />
    </div>
  );
};
