import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { 
  Briefcase, 
  Sparkles, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  CheckCircle2, 
  Compass, 
  Bookmark, 
  FileText, 
  PlusCircle, 
  ShieldCheck,
  Calendar,
  Target,
  Zap
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenAuth: (mode?: 'login' | 'signup' | 'instant', role?: 'jobseeker' | 'recruiter') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, userProfile, logout, demoLoginAs } = useAuth();
  const { notifications, markNotificationAsRead } = useJobs();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);

  const role = userProfile?.role || 'jobseeker';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xl shadow-sm group-hover:scale-105 transition-transform">
                <span className="text-emerald-400">K</span>
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-neutral-900 flex items-center gap-1">
                  Kormo <span className="text-emerald-600">BD</span>
                </span>
                <span className="text-[10px] block text-neutral-400 font-medium uppercase tracking-wider -mt-1">
                  Modern Talent Hub
                </span>
              </div>
            </button>

            {/* Quick Demo Switcher Pills for convenience */}
            <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-neutral-200 gap-1.5 text-xs text-neutral-500">
              <span className="font-medium mr-1 text-neutral-400">Demo as:</span>
              <button
                onClick={() => demoLoginAs('jobseeker')}
                className={`px-2 py-0.5 rounded-full border transition-colors ${role === 'jobseeker' && user ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold' : 'border-neutral-200 hover:bg-neutral-100'}`}
              >
                Job Seeker
              </button>
              <button
                onClick={() => demoLoginAs('recruiter')}
                className={`px-2 py-0.5 rounded-full border transition-colors ${role === 'recruiter' && user ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold' : 'border-neutral-200 hover:bg-neutral-100'}`}
              >
                Recruiter
              </button>
              <button
                onClick={() => demoLoginAs('admin')}
                className={`px-2 py-0.5 rounded-full border transition-colors ${role === 'admin' && user ? 'bg-purple-50 text-purple-700 border-purple-300 font-semibold' : 'border-neutral-200 hover:bg-neutral-100'}`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 font-medium text-sm text-neutral-600">
            <button
              onClick={() => onNavigate('jobs')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${currentView === 'jobs' ? 'text-neutral-900 font-semibold bg-neutral-100' : 'hover:text-neutral-900 hover:bg-neutral-50'}`}
            >
              Explore Jobs
            </button>
            <button
              onClick={() => onNavigate('companies')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${currentView === 'companies' ? 'text-neutral-900 font-semibold bg-neutral-100' : 'hover:text-neutral-900 hover:bg-neutral-50'}`}
            >
              Companies
            </button>
            <button
              onClick={() => onNavigate('market_intelligence')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${currentView === 'market_intelligence' ? 'text-neutral-900 font-semibold bg-neutral-100' : 'hover:text-neutral-900 hover:bg-neutral-50'}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Market Research</span>
            </button>

            {user && role === 'jobseeker' && (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${currentView === 'dashboard' ? 'text-neutral-900 font-semibold bg-neutral-100' : 'hover:text-neutral-900 hover:bg-neutral-50'}`}
                >
                  My Dashboard
                </button>
                <button
                  onClick={() => onNavigate('skills_gap')}
                  className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${currentView === 'skills_gap' ? 'text-emerald-800 font-semibold bg-emerald-50' : 'hover:text-neutral-900 hover:bg-neutral-50'}`}
                >
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Skills Gap</span>
                </button>
                <button
                  onClick={() => onNavigate('applications')}
                  className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${currentView === 'applications' ? 'text-neutral-900 font-semibold bg-neutral-100' : 'hover:text-neutral-900 hover:bg-neutral-50'}`}
                >
                  Applications
                </button>
                <button
                  onClick={() => onNavigate('profile_builder')}
                  className="px-3 py-2 rounded-lg text-emerald-700 font-medium hover:bg-emerald-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  AI Resume Parser
                </button>
              </>
            )}

            {user && role === 'recruiter' && (
              <>
                <button
                  onClick={() => onNavigate('recruiter_dashboard')}
                  className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${currentView === 'recruiter_dashboard' ? 'text-neutral-900 font-semibold bg-neutral-100' : 'hover:text-neutral-900 hover:bg-neutral-50'}`}
                >
                  Recruiter Hub
                </button>
                <button
                  onClick={() => onNavigate('post_job')}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5 text-xs shadow-sm cursor-pointer ml-1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Post a Job
                </button>
              </>
            )}

            {user && role === 'admin' && (
              <button
                onClick={() => onNavigate('admin_panel')}
                className={`px-3 py-2 rounded-lg transition-colors text-purple-700 font-medium hover:bg-purple-50 flex items-center gap-1 cursor-pointer`}
              >
                <ShieldCheck className="w-4 h-4" />
                Moderation Panel
              </button>
            )}
          </nav>

          {/* Right Header: Auth & Notifications */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors relative cursor-pointer"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifs.length > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-600 rounded-full ring-2 ring-white animate-pulse" />
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-neutral-100 flex items-center justify-between">
                        <span className="font-semibold text-sm text-neutral-900">Notifications</span>
                        <span className="text-xs text-neutral-500">{unreadNotifs.length} new</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 text-xs">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-neutral-400">No notifications yet</div>
                        ) : (
                          notifications.slice(0, 8).map(n => (
                            <div 
                              key={n.id} 
                              onClick={() => {
                                markNotificationAsRead(n.id);
                                if (n.link) onNavigate(n.link.replace('/', ''));
                                setNotifDropdownOpen(false);
                              }}
                              className={`p-3.5 hover:bg-neutral-50 transition-colors cursor-pointer ${!n.read ? 'bg-emerald-50/40' : ''}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold text-neutral-900">{n.title}</p>
                                {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />}
                              </div>
                              <p className="text-neutral-600 mt-1">{n.message}</p>
                              <span className="text-[10px] text-neutral-400 mt-1.5 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar & Menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-semibold text-xs border border-neutral-200">
                      {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in">
                      <div className="px-4 py-2.5 border-b border-neutral-100">
                        <p className="font-medium text-sm text-neutral-900 truncate">{userProfile?.displayName || user.email}</p>
                        <p className="text-xs text-neutral-400 capitalize">{role}</p>
                      </div>

                      {role === 'jobseeker' && (
                        <>
                          <button
                            onClick={() => {
                              onNavigate('profile_builder');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                          >
                            <User className="w-4 h-4 text-neutral-400" />
                            My Profile & Resume
                          </button>
                          <button
                            onClick={() => {
                              onNavigate('applications');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                          >
                            <FileText className="w-4 h-4 text-neutral-400" />
                            Application Tracker
                          </button>
                          <button
                            onClick={() => {
                              onNavigate('saved_jobs');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Bookmark className="w-4 h-4 text-neutral-400" />
                            Saved Jobs
                          </button>
                          <button
                            onClick={() => {
                              onNavigate('skills_gap');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Target className="w-4 h-4 text-emerald-600" />
                            Skills Gap Analysis
                          </button>
                          <button
                            onClick={() => {
                              onNavigate('interviews');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Calendar className="w-4 h-4 text-neutral-400" />
                            Upcoming Interviews
                          </button>
                        </>
                      )}

                      {role === 'recruiter' && (
                        <>
                          <button
                            onClick={() => {
                              onNavigate('recruiter_dashboard');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Briefcase className="w-4 h-4 text-neutral-400" />
                            Recruiter Dashboard
                          </button>
                          <button
                            onClick={() => {
                              onNavigate('post_job');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                          >
                            <PlusCircle className="w-4 h-4 text-neutral-400" />
                            Create New Job
                          </button>
                        </>
                      )}

                      <div className="border-t border-neutral-100 my-1" />
                      <button
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await logout();
                          onNavigate('landing');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('instant', 'jobseeker')}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Instant Access</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => {
              onNavigate('jobs');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 font-medium text-neutral-700"
          >
            Explore Jobs
          </button>
          <button
            onClick={() => {
              onNavigate('companies');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 font-medium text-neutral-700"
          >
            Companies
          </button>
          <button
            onClick={() => {
              onNavigate('market_intelligence');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 font-medium text-neutral-700 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" /> Market Research
          </button>

          {user ? (
            <>
              {role === 'jobseeker' ? (
                <>
                  <button
                    onClick={() => {
                      onNavigate('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 font-medium text-neutral-700"
                  >
                    Job Seeker Dashboard
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('profile_builder');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 font-medium text-emerald-600 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" /> AI Resume Profile
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('skills_gap');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 font-medium text-neutral-700 flex items-center gap-1.5"
                  >
                    <Target className="w-4 h-4 text-emerald-600" /> Skills Gap Analysis
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('applications');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 font-medium text-neutral-700"
                  >
                    Applications
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onNavigate('recruiter_dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 font-medium text-neutral-700"
                  >
                    Recruiter Hub
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('post_job');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 font-medium text-emerald-600"
                  >
                    + Post a Job
                  </button>
                </>
              )}
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await logout();
                  onNavigate('landing');
                }}
                className="w-full text-left py-2 font-medium text-red-600 pt-2 border-t border-neutral-100"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-neutral-100 space-y-2">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center rounded-lg border border-neutral-300 font-medium text-neutral-700"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onOpenAuth('signup');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center rounded-lg bg-emerald-600 text-white font-medium"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
