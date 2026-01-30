import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  CreditCard,
  Users,
  Settings,
  Link as LinkIcon,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { businessApi } from '../services/businessApi';
import { Notification } from '../types/api';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: { label: string; path?: string }[];
}

export default function DashboardLayout({ children, title, breadcrumbs }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const businessName = user?.user_metadata?.businessName || user?.email?.split('@')[0] || 'Business Name';
  const businessInitial = businessName.charAt(0).toUpperCase();

  const loadNotifications = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoadingNotifications(true);
      const business = await businessApi.getByEmail(user.email);
      const notificationsData = await businessApi.getNotifications(business.id);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      loadNotifications();
    }
  }, [user?.email, loadNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await businessApi.markNotificationAsRead(notification.id);
        // Update local state
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application_approved':
        return '✅';
      case 'application_declined':
        return '❌';
      case 'application_under_review':
        return '⏳';
      default:
        return '🔔';
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Payment Rules', href: '/dashboard/rules', icon: Settings },
    { name: 'Payment Link', href: '/dashboard/payment-link', icon: LinkIcon },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleProfileNav = (path: string) => {
    setProfileDropdownOpen(false);
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-gray-900">TrustRail</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {businessInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{businessName}</p>
                  <p className="text-xs text-gray-500">Starter Plan</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <nav className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                    {breadcrumbs.map((crumb, index) => (
                      <div key={index} className="flex items-center">
                        {index > 0 && <span className="mx-2">/</span>}
                        {crumb.path ? (
                          <Link to={crumb.path} className="hover:text-gray-700">
                            {crumb.label}
                          </Link>
                        ) : (
                          <span className="text-gray-700">{crumb.label}</span>
                        )}
                      </div>
                    ))}
                  </nav>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-30 max-h-96 overflow-hidden flex flex-col">
                  <div className="px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-200 flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {loadingNotifications ? (
                      <div className="px-4 py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.created_at).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="border-t border-gray-200">
                      <button
                        className="w-full text-center text-sm text-blue-600 py-3 hover:bg-blue-50 font-medium transition-colors"
                        onClick={() => setShowNotifications(false)}
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {businessInitial}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleProfileNav('/dashboard/profile')}
                      >
                        View Profile
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleProfileNav('/dashboard/settings')}
                      >
                        Settings
                      </button>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
