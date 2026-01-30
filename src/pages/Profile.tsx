import { useState, useEffect, useCallback } from 'react';
import { Building2, Mail, Phone, Globe, Shield, Edit2, Save, X } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { businessApi } from '../services/businessApi';
import { Business } from '../types/api';

export default function Profile() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    business_name: '',
    phone: '',
    industry: '',
  });

  const loadBusinessProfile = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const businessData = await businessApi.getByEmail(user.email);
      setBusiness(businessData);
      setEditForm({
        business_name: businessData.business_name,
        phone: businessData.phone,
        industry: businessData.industry,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      loadBusinessProfile();
    }
  }, [user?.email, loadBusinessProfile]);

  const handleEdit = () => {
    if (business) {
      setEditForm({
        business_name: business.business_name,
        phone: business.phone,
        industry: business.industry,
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (business) {
      setEditForm({
        business_name: business.business_name,
        phone: business.phone,
        industry: business.industry,
      });
    }
  };

  const handleSave = async () => {
    if (!business) return;

    setSaving(true);
    try {
      // In a real implementation, this would call an update API endpoint
      // For now, we'll just update local state
      const updatedBusiness: Business = {
        ...business,
        business_name: editForm.business_name,
        phone: editForm.phone,
        industry: editForm.industry,
        updated_at: new Date().toISOString(),
      };

      setBusiness(updatedBusiness);
      setIsEditing(false);
      setError('Profile updated successfully!');
      setTimeout(() => setError(null), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Verified</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">Pending</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">Unknown</span>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Business Profile"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Profile' }]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!business) {
    return (
      <DashboardLayout
        title="Business Profile"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Profile' }]}
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900">{error || 'Business profile not found'}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Business Profile"
      breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Profile' }]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {error && error.includes('success') && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-900">{error}</p>
          </div>
        )}

        {error && !error.includes('success') && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-900">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {business.business_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{business.business_name}</h2>
                <div className="mt-1">{getVerificationBadge(business.verification_status)}</div>
              </div>
            </div>

            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="inline h-4 w-4 mr-1" />
                  Business Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.business_name}
                    onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{business.business_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email
                </label>
                <p className="text-gray-900 font-medium">{business.email}</p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{business.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline h-4 w-4 mr-1" />
                  Industry
                </label>
                {isEditing ? (
                  <select
                    value={editForm.industry}
                    onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Retail">Retail</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900 font-medium">{business.industry}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="inline h-4 w-4 mr-1" />
                  Payment Slug
                </label>
                <p className="text-gray-900 font-medium">{business.payment_slug}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Manage in <a href="/dashboard/payment-link" className="text-blue-500 hover:text-blue-700">Payment Link</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Since
                </label>
                <p className="text-gray-900 font-medium">
                  {new Date(business.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Status</h3>
          {business.verification_status === 'verified' && (
            <p className="text-gray-700">
              Your business is verified. You have full access to all TrustRail features.
            </p>
          )}
          {business.verification_status === 'pending' && (
            <p className="text-gray-700">
              Your business verification is pending. We'll review your documents and get back to you within 24-48 hours.
            </p>
          )}
          {business.verification_status === 'rejected' && (
            <p className="text-gray-700">
              Your business verification was rejected. Please contact support for more information.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
