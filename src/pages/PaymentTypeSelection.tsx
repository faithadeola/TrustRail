import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Building2, CheckCircle } from 'lucide-react';
import { businessApi } from '../services/businessApi';
import { Business } from '../types/api';

export default function PaymentTypeSelection() {
  const { businessSlug } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBusinessData();
  }, [businessSlug]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await businessApi.getBySlug(businessSlug!);
      setBusiness(data);
    } catch (err: any) {
      console.error('Error loading business:', err);
      setError(err.message || 'Failed to load business information');
      setBusiness(null);
    } finally {
      setLoading(false);
    }
  };



  const handleSelectType = (type: 'INSTALMENT' | 'SUBSCRIPTION') => {
    navigate(`/pay/${businessSlug}/apply`, { state: { paymentType: type } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h1>
          <p className="text-gray-600">
            The payment link you're looking for doesn't exist or has been disabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with Business Branding */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            {business.logo_url ? (
              <img 
                src={business.logo_url} 
                alt={business.business_name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-blue-100 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{business.business_name || "Business Name"}</h1>
              <p className="text-gray-600">Flexible Payment Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How Would You Like to Pay?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the payment option that works best for you. Get approved instantly with our smart trust evaluation.
          </p>
          
          {/* Trust Badges */}
          <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Instant Approval</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>No Hidden Fees</span>
            </div>
          </div>
        </div>

        {/* Payment Type Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Instalment Card */}
          <div 
            onClick={() => handleSelectType('INSTALMENT')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-500 overflow-hidden"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Instalment Plan</h3>
              <p className="text-blue-100">Split a large payment into smaller amounts</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">One-Time Purchase</p>
                    <p className="text-sm text-gray-600">Pay for a service or product over time</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Fixed Schedule</p>
                    <p className="text-sm text-gray-600">Clear end date with set number of payments</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Lower Down Payment</p>
                    <p className="text-sm text-gray-600">Start with just 20-30% upfront</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-2">Example:</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Total Amount: <span className="font-bold">₦150,000</span></p>
                  <p>Down Payment: <span className="font-bold">₦45,000</span> (30%)</p>
                  <p>Then: <span className="font-bold">₦17,500/month</span> for 6 months</p>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors group-hover:scale-105 transform duration-200">
                Choose Instalment Plan →
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Perfect for: Medical bills, school fees, equipment purchases
              </p>
            </div>
          </div>

          {/* Subscription Card */}
          <div 
            onClick={() => handleSelectType('SUBSCRIPTION')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-500 overflow-hidden"
          >
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <RefreshCw className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Recurring Subscription</h3>
              <p className="text-purple-100">Ongoing monthly service or membership</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Automatic Renewal</p>
                    <p className="text-sm text-gray-600">Set it once, payments happen automatically</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Flexible Commitment</p>
                    <p className="text-sm text-gray-600">Cancel anytime after minimum period</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Ongoing Access</p>
                    <p className="text-sm text-gray-600">Continue service as long as you need</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-2">Example:</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Monthly Payment: <span className="font-bold">₦25,000</span></p>
                  <p>Minimum Term: <span className="font-bold">6 months</span></p>
                  <p>After that: <span className="font-bold">Cancel anytime</span></p>
                </div>
              </div>

              <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors group-hover:scale-105 transform duration-200">
                Choose Subscription →
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Perfect for: Gym memberships, classes, health plans
              </p>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-2">Not sure which option to choose?</p>
          <button className="text-blue-600 hover:text-blue-700 font-semibold">
            Contact {business.business_name || "Business Name"} Support →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-600 flex flex-col items-center">
          <p>🔒 Your payment information is secure and encrypted</p>
          <div className="flex items-center justify-center mt-2 space-x-2">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.business_name} className="h-6 w-6 rounded object-cover" />
            ) : (
              <span className="inline-flex items-center justify-center h-6 w-6 rounded bg-blue-100">
                <Building2 className="h-4 w-4 text-blue-600" />
              </span>
            )}
            <span className="font-semibold text-gray-900">{business.business_name || "Business Name"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}