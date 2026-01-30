import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { businessApi } from '../services/businessApi';
import { DashboardStats, Transaction } from '../types/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const business = await businessApi.getByEmail(user.email);
      const [statsData, transactionsData] = await Promise.all([
        businessApi.getStats(business.id),
        businessApi.getTransactions(business.id, 5),
      ]);
      setStats(statsData);
      setTransactions(transactionsData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      loadDashboardData();
    }
  }, [user?.email, loadDashboardData]);

  const statsCards = [
    {
      name: 'Total Payments',
      value: stats ? `${stats.totalPayments}` : '0',
      icon: TrendingUp,
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
    },
    {
      name: 'Success Rate',
      value: stats ? `${stats.successRate}%` : '0%',
      icon: CheckCircle,
      bgColor: 'bg-green-500',
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
    },
    {
      name: 'Pending Approvals',
      value: stats ? `${stats.pendingApprovals}` : '0',
      icon: Clock,
      bgColor: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
    },
    {
      name: 'Failed Payments',
      value: stats ? `${stats.failedPayments}` : '0',
      icon: XCircle,
      bgColor: 'bg-red-500',
      textColor: 'text-red-600',
      bgLight: 'bg-red-50',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" breadcrumbs={[{ label: 'Dashboard' }]}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard" breadcrumbs={[{ label: 'Dashboard' }]}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgLight}`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.name}</h3>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-8 text-white">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-2">Complete Your Setup</h2>
            <p className="text-blue-100 mb-6">
              Configure your Trust rules to access eligibility before accepting instalment payments from customers
            </p>
            <button
              onClick={() => navigate('/dashboard/rules')}
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Configure Trust Rules
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No transactions yet</p>
                <p className="text-sm mt-1">Your recent transactions will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate('/dashboard/transactions')}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{transaction.customer_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₦{(transaction.total_amount || transaction.recurring_amount || 0).toLocaleString()}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : transaction.status === 'under_review'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {transaction.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/dashboard/transactions')}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
                >
                  View All Transactions
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard/rules')}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium text-gray-900">Configure Trust Rules</p>
                <p className="text-sm text-gray-500">Set up your instalment policies</p>
              </button>
              <button
                onClick={() => navigate('/dashboard/payment-link')}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium text-gray-900">View Payment Link</p>
                <p className="text-sm text-gray-500">Share your payment portal</p>
              </button>
              <button
                onClick={() => navigate('/dashboard/customers')}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium text-gray-900">Manage Customers</p>
                <p className="text-sm text-gray-500">View and manage customer data</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
