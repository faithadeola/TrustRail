import { useState, useEffect, useRef, useCallback } from 'react';
import { CreditCard, Download, Mail, MoreVertical, Eye, FileText, X } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { businessApi } from '../services/businessApi';
import { paymentApi } from '../services/paymentApi';
import { PaymentApplication } from '../types/api';

interface Transaction {
  id: string;
  customer_name: string;
  customer_email: string;
  service_description: string;
  amount: number;
  status: 'approved' | 'pending' | 'failed';
  type: string;
  created_at: string;
}

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState('today');
  const [statusFilter, setStatusFilter] = useState<string[]>(['all']);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const exportDropdownRef = useRef<HTMLDivElement | null>(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [detailsModal, setDetailsModal] = useState<{ open: boolean; transaction: Transaction | null }>({ open: false, transaction: null });

  const loadTransactions = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const business = await businessApi.getByEmail(user.email);
      const applications = await paymentApi.getBusinessApplications(business.id);

      const formattedTransactions: Transaction[] = applications.map((app: PaymentApplication) => ({
        id: app.id,
        customer_name: app.customer_name,
        customer_email: app.customer_email,
        service_description: app.service_description || 'Service',
        amount: app.total_amount || app.recurring_amount || 0,
        status: app.status === 'approved' ? 'approved' : app.status === 'declined' ? 'failed' : 'pending',
        type: app.payment_type === 'INSTALMENT' ? 'Instalment' : 'Subscription',
        created_at: app.created_at,
      }));
      setTransactions(formattedTransactions);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      loadTransactions();
    }
  }, [user?.email, loadTransactions]);

  const getStatusBadgeColor = (status: string) => {
    if (status === 'approved') return 'bg-green-100 text-green-700';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const handleExportCSV = () => {
    const headers = [
      'Customer Name',
      'Customer Email',
      'Service',
      'Amount',
      'Status',
      'Type',
      'Date',
    ];
    const rows = filteredTransactions.map((tx) => [
      tx.customer_name,
      tx.customer_email,
      tx.service_description,
      tx.amount,
      tx.status,
      tx.type,
      new Date(tx.created_at).toLocaleDateString(),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleViewDetails = (transaction: Transaction) => {
    setDetailsModal({ open: true, transaction });
  };

  const handleDownloadReceipt = (transaction: Transaction) => {
    const content = `Receipt for ${transaction.customer_name}\nAmount: ₦${transaction.amount}\nStatus: ${transaction.status}\nDate: ${new Date(transaction.created_at).toLocaleDateString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${transaction.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEmailCustomer = (transaction: Transaction) => {
    window.location.href = `mailto:${transaction.customer_email}?subject=Regarding your payment&body=Dear ${transaction.customer_name},%0D%0A%0D%0AWe are contacting you regarding your recent transaction of ₦${transaction.amount}.`;
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.customer_email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter.includes('all') || statusFilter.includes(tx.status);

    return matchesSearch && matchesStatus;
  });

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const stats = {
    total: filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0),
    successful: filteredTransactions.filter((tx) => tx.status === 'approved').length,
    successRate: Math.round(
      (filteredTransactions.filter((tx) => tx.status === 'approved').length /
        Math.max(filteredTransactions.length, 1)) *
        100
    ),
    pending: filteredTransactions.filter((tx) => tx.status === 'pending').length,
    failed: filteredTransactions.filter((tx) => tx.status === 'failed').length,
    failedAmount: filteredTransactions
      .filter((tx) => tx.status === 'failed')
      .reduce((sum, tx) => sum + tx.amount, 0),
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Transactions"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Transactions' }]}
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
        title="Transactions"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Transactions' }]}
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Transactions"
      breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Transactions' }]}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          <div className="relative" ref={exportDropdownRef}>
            <button
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              onClick={() => setExportDropdownOpen((open) => !open)}
            >
              <Download className="h-5 w-5" />
              <span>Export</span>
              <MoreVertical className="h-4 w-4 ml-1" />
            </button>
            {exportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  onClick={() => { handleExportCSV(); setExportDropdownOpen(false); }}
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter[0]}
                onChange={(e) => setStatusFilter([e.target.value])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="approved">Successful</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Customer name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Apply Filters
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter(['all']);
                  setDateFilter('today');
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600 text-sm mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">₦{stats.total.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600 text-sm mb-1">Successful</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.successful} <span className="text-sm text-gray-600">({stats.successRate}%)</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600 text-sm mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-600">
              {stats.failed} <span className="text-sm text-gray-600">(₦{stats.failedAmount.toLocaleString()})</span>
            </p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transactions Yet</h3>
            <p className="text-gray-600">Your transaction history will appear here</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems(paginatedTransactions.map((tx) => tx.id));
                            } else {
                              setSelectedItems([]);
                            }
                          }}
                          className="h-4 w-4 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Service
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(transaction.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, transaction.id]);
                              } else {
                                setSelectedItems(selectedItems.filter((id) => id !== transaction.id));
                              }
                            }}
                            className="h-4 w-4 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{transaction.customer_name}</p>
                            <p className="text-sm text-gray-500">{transaction.customer_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {transaction.service_description}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          ₦{transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                              transaction.status
                            )}`}
                          >
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{transaction.type}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right relative">
                          <button
                            onClick={() =>
                              setExpandedAction(
                                expandedAction === transaction.id ? null : transaction.id
                              )
                            }
                            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-5 w-5 text-gray-400" />
                          </button>

                          {expandedAction === transaction.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setExpandedAction(null)}
                              />
                              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                  onClick={() => handleViewDetails(transaction)}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>View Details</span>
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                  onClick={() => handleDownloadReceipt(transaction)}
                                >
                                  <FileText className="h-4 w-4" />
                                  <span>Download Receipt</span>
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 border-t border-gray-200"
                                  onClick={() => handleEmailCustomer(transaction)}
                                >
                                  <Mail className="h-4 w-4" />
                                  <span>Email Customer</span>
                                </button>
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Items per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((page, index, array) => {
                    if (index > 0 && array[index - 1] !== page - 1) {
                      return (
                        <span key={`ellipsis-${page}`} className="px-2 text-gray-600">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {detailsModal.open && detailsModal.transaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setDetailsModal({ open: false, transaction: null })}>
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold mb-4">Transaction Details</h3>
            <div className="space-y-2">
              <div><span className="font-semibold">Customer:</span> {detailsModal.transaction.customer_name}</div>
              <div><span className="font-semibold">Email:</span> {detailsModal.transaction.customer_email}</div>
              <div><span className="font-semibold">Service:</span> {detailsModal.transaction.service_description}</div>
              <div><span className="font-semibold">Amount:</span> ₦{detailsModal.transaction.amount.toLocaleString()}</div>
              <div><span className="font-semibold">Status:</span> {detailsModal.transaction.status}</div>
              <div><span className="font-semibold">Type:</span> {detailsModal.transaction.type}</div>
              <div><span className="font-semibold">Date:</span> {new Date(detailsModal.transaction.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
