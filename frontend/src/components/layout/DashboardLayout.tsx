'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Activity, ChevronDown, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import type { NavItem } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole: string;
  navItems: NavItem[];
  roleLabel: string;
}

export default function DashboardLayout({ children, requiredRole, navItems, roleLabel }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [fullName, setFullName] = useState('');
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('role');
    if (role !== requiredRole) {
      router.push('/login');
      return;
    }

    const cached = localStorage.getItem('userFullName');
    if (cached) setFullName(cached);

    const profileFn =
      requiredRole === 'admin'
        ? api.admin.getProfile
        : requiredRole === 'doctor'
        ? api.doctor.getProfile
        : api.patient.getProfile;

    profileFn().then((d) => {
      const name = (d as { fullName?: string }).fullName || '';
      if (name) {
        setFullName(name);
        localStorage.setItem('userFullName', name);
      }
    }).catch(() => {
      const email = localStorage.getItem('userEmail') || '';
      setFullName(email.split('@')[0] || 'User');
    });
  }, [router, requiredRole]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar — icon only with hover tooltips */}
      <aside className="flex w-14 flex-shrink-0 flex-col bg-slate-900">
        <div className="h-16 border-b border-slate-700/60" />
        <nav className="flex flex-1 flex-col py-4">
          <ul className="flex flex-col items-center gap-1">
            {navItems.map(({ label, href, icon }) => {
              const isActive =
                pathname === href ||
                (href !== `/dashboard/${requiredRole}` && pathname.startsWith(href));
              return (
                <li key={href} className="group/item relative w-full">
                  <Link
                    href={href}
                    className={`mx-auto flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {icon}
                  </Link>
                  <span className="pointer-events-none absolute left-[3.75rem] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity delay-75 group-hover/item:opacity-100">
                    <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <Link href={`/dashboard/${requiredRole}`} className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-tight">MediCare</p>
              <p className="text-[10px] text-slate-400 capitalize leading-tight">{roleLabel}</p>
            </div>
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-bold text-white shadow-sm">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[160px] truncate">{fullName}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-1.5 w-48 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-900 truncate">{fullName}</p>
                  <p className="text-[11px] text-slate-400 capitalize mt-0.5">{roleLabel}</p>
                </div>
                <button
                  onClick={() => { setDropdownOpen(false); setShowLogoutModal(true); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Sign out?</h3>
              <p className="mt-1.5 text-sm text-slate-500">
                You will be returned to the login page. Any unsaved changes will be lost.
              </p>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
