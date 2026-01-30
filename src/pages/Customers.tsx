import { useState, useEffect, useCallback } from 'react';
import { Users, Grid, List, MoreVertical } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { businessApi } from '../services/businessApi';
import { paymentApi } from '../services/paymentApi';
import { Customer } from '../types/api';

interface CustomerViewModel {
  id: string;
  name: string;
  email: string;
  trust_score: number;
  total_payments: number;
  success_rate: number;
  active_plans: number;
  last_payment: string;
}

export default function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<CustomerViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [trustScoreRange, setTrustScoreRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState('name');
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const business = await businessApi.getByEmail(user.email);
      const customersData = await paymentApi.getCustomers(business.id);

      // Map API Customer data to CustomerViewModel
      const viewModels: CustomerViewModel[] = customersData.map((customer: Customer) => ({
        id: customer.customer_email,
        name: customer.customer_name,
        email: customer.customer_email,
        trust_score: Math.round(customer.average_trust_score),
        total_payments: customer.total_payments,
        success_rate: customer.total_payments > 0
          ? Math.round((customer.successful_payments / customer.total_payments) * 100)
          : 0,
        active_plans: customer.active_plans,
        last_payment: customer.last_payment_date,
      }));

      setCustomers(viewModels);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load customers';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      loadCustomers();
    }
  }, [user?.email, loadCustomers]);

  const filteredCustomers = customers
    .filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTrustScore =
        customer.trust_score >= trustScoreRange[0] &&
        customer.trust_score <= trustScoreRange[1];

      return matchesSearch && matchesTrustScore;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'trust') return b.trust_score - a.trust_score;
      if (sortBy === 'recent')
        return new Date(b.last_payment).getTime() - new Date(a.last_payment).getTime();
      return 0;
    });

  // 5-Tier Trust Distribution System
  // NOTE: This will be replaced with backend-provided data when MySQL backend is integrated
  const stats = {
    total: customers.length,
    trusted: customers.filter((c) => c.trust_score >= 80).length,       // 80-100: Trusted (Dark Green)
    verified: customers.filter((c) => c.trust_score >= 60 && c.trust_score < 80).length,  // 60-79: Verified (Blue)
    new: customers.filter((c) => c.trust_score >= 40 && c.trust_score < 60).length,       // 40-59: New (Yellow)
    restricted: customers.filter((c) => c.trust_score >= 20 && c.trust_score < 40).length, // 20-39: Restricted (Orange)
    defaulted: customers.filter((c) => c.trust_score < 20).length,      // 0-19: Defaulted (Red)
  };

  const getTrustColor = (score: number) => {
    if (score >= 80) return 'text-green-700';      // Trusted
    if (score >= 60) return 'text-blue-600';       // Verified
    if (score >= 40) return 'text-yellow-600';     // New
    if (score >= 20) return 'text-orange-600';     // Restricted
    return 'text-red-600';                         // Defaulted
  };

  const getTrustBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';        // Trusted
    if (score >= 60) return 'bg-blue-100';         // Verified
    if (score >= 40) return 'bg-yellow-100';       // New
    if (score >= 20) return 'bg-orange-100';       // Restricted
    return 'bg-red-100';                           // Defaulted
  };

  const getTrustBorderColor = (score: number) => {
    if (score >= 80) return 'border-green-200';    // Trusted
    if (score >= 60) return 'border-blue-200';     // Verified
    if (score >= 40) return 'border-yellow-200';   // New
    if (score >= 20) return 'border-orange-200';   // Restricted
    return 'border-red-200';                       // Defaulted
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Customers"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Customers' }]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Customers"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Customers' }]}
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Customers"
      breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Customers' }]}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-gray-600 text-xs mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-green-200 bg-green-50 p-4">
            <p className="text-green-700 text-xs mb-1 font-medium">Trusted (80-100)</p>
            <p className="text-2xl font-bold text-green-700">{stats.trusted}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-blue-200 bg-blue-50 p-4">
            <p className="text-blue-700 text-xs mb-1 font-medium">Verified (60-79)</p>
            <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-yellow-700 text-xs mb-1 font-medium">New (40-59)</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.new}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-orange-200 bg-orange-50 p-4">
            <p className="text-orange-700 text-xs mb-1 font-medium">Restricted (20-39)</p>
            <p className="text-2xl font-bold text-orange-600">{stats.restricted}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-red-200 bg-red-50 p-4">
            <p className="text-red-700 text-xs mb-1 font-medium">Defaulted (0-19)</p>
            <p className="text-2xl font-bold text-red-600">{stats.defaulted}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trust Score: {trustScoreRange[0]}-{trustScoreRange[1]}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={trustScoreRange[1]}
                onChange={(e) => setTrustScoreRange([trustScoreRange[0], Number(e.target.value)])}
                className="w-full"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="trust">Sort by Trust Score</option>
              <option value="recent">Sort by Recent</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Grid className="h-5 w-5 mx-auto" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="h-5 w-5 mx-auto" />
              </button>
            </div>
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Customers Yet</h3>
            <p className="text-gray-600">Your customer list will appear here</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className={`bg-white rounded-lg shadow-sm border-2 ${getTrustBorderColor(
                  customer.trust_score
                )} p-6 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setExpandedAction(
                        expandedAction === customer.id ? null : customer.id
                      )
                    }
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-center">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center ${getTrustBgColor(
                        customer.trust_score
                      )}`}
                    >
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${getTrustColor(customer.trust_score)}`}>
                          {customer.trust_score}
                        </p>
                        <p className="text-xs text-gray-600">/100</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600 text-xs">Payments</p>
                      <p className="font-semibold text-gray-900">{customer.total_payments}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600 text-xs">Success Rate</p>
                      <p className="font-semibold text-gray-900">{customer.success_rate}%</p>
                    </div>
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                      Trust Score
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                      Payments
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                      Active Plans
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Last Payment
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${getTrustBgColor(
                            customer.trust_score
                          )}`}
                        >
                          <p className={`font-semibold text-sm ${getTrustColor(customer.trust_score)}`}>
                            {customer.trust_score}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-900 font-medium">
                        {customer.total_payments}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-900 font-medium">
                        {customer.success_rate}%
                      </td>
                      <td className="px-6 py-4 text-center text-gray-900 font-medium">
                        {customer.active_plans}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(customer.last_payment).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-500 hover:text-blue-700 font-medium text-sm">
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
