import { useState } from 'react';
import { Lock, Bell, CreditCard, Shield, Eye, EyeOff, Trash2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'security' | 'notifications' | 'billing' | 'danger'>('security');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    paymentAlerts: true,
    weeklyReports: false,
    marketingEmails: false,
  });

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      setPasswordSuccess('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
      setPasswordError(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
    );

    if (confirmed) {
      const doubleConfirm = window.confirm(
        'This is your last chance. Are you absolutely sure you want to delete your account?'
      );

      if (doubleConfirm) {
        alert('Account deletion is not yet implemented. Please contact support to delete your account.');
      }
    }
  };

  const tabs = [
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard },
    { id: 'danger' as const, label: 'Danger Zone', icon: Shield },
  ];

  return (
    <DashboardLayout
      title="Settings"
      breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Settings' }]}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Change Password</h3>
                  <p className="text-gray-600 mb-4">
                    Update your password to keep your account secure
                  </p>
                </div>

                {passwordError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-900">{passwordError}</p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-900">{passwordSuccess}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    disabled={changingPassword}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {changingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Account Email</h4>
                  <p className="text-gray-600">{user?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Contact support to change your email address
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Notification Preferences
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Manage how you receive notifications
                  </p>
                </div>

                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())}
                        </p>
                        <p className="text-sm text-gray-600">
                          {key === 'emailNotifications' &&
                            'Receive email notifications for important updates'}
                          {key === 'paymentAlerts' &&
                            'Get notified when payments are received'}
                          {key === 'weeklyReports' &&
                            'Receive weekly summary reports'}
                          {key === 'marketingEmails' &&
                            'Receive product updates and marketing emails'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(key as keyof typeof notifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Billing & Subscription
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Manage your subscription and billing information
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">Current Plan</h4>
                      <p className="text-2xl font-bold text-blue-600 mt-1">Starter Plan</p>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600">No monthly fee</p>
                    <p className="text-gray-600">Unlimited transactions</p>
                    <p className="text-gray-600">Standard support</p>
                  </div>

                  <button
                    onClick={() => alert('Upgrade feature coming soon!')}
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                  >
                    Upgrade to Pro
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    Transaction Fees
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Instalment Payments</span>
                      <span className="font-semibold text-gray-900">2.5% + ₦100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subscription Payments</span>
                      <span className="font-semibold text-gray-900">2.5% + ₦100</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-gray-600 mb-4">
                    Irreversible and destructive actions
                  </p>
                </div>

                <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
                  <div className="flex items-start space-x-4">
                    <Trash2 className="h-6 w-6 text-red-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Delete Account
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        Once you delete your account, there is no going back. This will
                        permanently delete your business profile, all payment data, customer
                        information, and transaction history.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <Shield className="h-6 w-6 text-gray-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Export Your Data
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        Download a copy of all your business data including customers,
                        transactions, and payment applications.
                      </p>
                      <button
                        onClick={() => alert('Export feature coming soon!')}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                      >
                        Export Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
