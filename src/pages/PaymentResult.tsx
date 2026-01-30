import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  Copy,
  Check as CheckIcon,
} from 'lucide-react';
import { paymentApi } from '../services/paymentApi';
import { PaymentApplication } from '../types/api';

export default function PaymentResult() {
  const { businessSlug, applicationId } = useParams<{
    businessSlug: string;
    applicationId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [application, setApplication] = useState<PaymentApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTip, setExpandedTip] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  const loadApplication = async () => {
    if (!applicationId) return;

    // Check if application data was passed via navigation state
    if (location.state?.application) {
      setApplication(location.state.application);
      setLoading(false);
      return;
    }

    // Otherwise, fetch from API
    try {
      const app = await paymentApi.getApplicationById(applicationId);
      setApplication(app);
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrustColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrustBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const handleCopy = () => {
    if (application?.id) {
      navigator.clipboard.writeText(application.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const improvementTips = [
    'Maintain a consistent payment history across multiple lenders',
    'Keep your account balances below 30% of your credit limits',
    'Ensure all your personal information is up-to-date and accurate',
    'Avoid multiple credit applications within a short period',
    'Make sure your account is in good standing with your bank',
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h1>
        </div>
      </div>
    );
  }

  const isApproved = application.status === 'approved';
  const isUnderReview = application.status === 'under_review';
  const isDeclined = application.status === 'declined';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {isApproved && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 animate-bounce">
                  <CheckCircle className="w-24 h-24 text-green-500" />
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Congratulations! You're Approved! 🎉
              </h1>
              <p className="text-gray-600 text-lg">
                Your application has been approved. You can now proceed with your instalment payment.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <p className="text-sm text-gray-600 mb-3">Your Trust Score</p>

              <div className="flex items-center justify-center mb-4">
                <div
                  className={`relative w-32 h-32 rounded-full flex items-center justify-center ${getTrustBgColor(
                    application.trust_score
                  )}`}
                >
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">
                      {application.trust_score}
                    </p>
                    <p className="text-sm text-gray-600">/100</p>
                  </div>
                </div>
              </div>

              <p className={`text-center font-semibold ${getTrustColor(application.trust_score)}`}>
                Excellent Trust Score
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Plan Summary</h2>

              <div className="space-y-3">
                {application.payment_type === 'INSTALMENT' && application.total_amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold text-gray-900">
                      ₦{application.total_amount.toLocaleString()}
                    </span>
                  </div>
                )}
                {application.payment_type === 'SUBSCRIPTION' && application.recurring_amount && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recurring Amount:</span>
                      <span className="font-semibold text-gray-900">
                        ₦{application.recurring_amount.toLocaleString()}
                      </span>
                    </div>
                    {application.commitment_months && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Commitment Period:</span>
                        <span className="font-semibold text-gray-900">
                          {application.commitment_months} months
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Frequency:</span>
                  <span className="font-semibold text-gray-900 capitalize">
                    {application.payment_frequency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    Approved
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.open('#', '_blank')}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Next Step: Authorize Mandate
            </button>

            <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
              You'll be redirected to your bank for secure authorization
            </p>

            <button
              onClick={() => navigate('/login')}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              Back to Home
            </button>
          </div>
        )}

        {isUnderReview && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Clock className="w-24 h-24 text-yellow-500 animate-spin" />
            </div>

            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Application Under Review ⏳
              </h1>
              <p className="text-gray-600 text-lg">
                We're evaluating your application. You'll receive a decision soon.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <p className="text-sm text-gray-600 mb-3">Your Trust Score</p>

              <div className="flex items-center justify-center mb-4">
                <div
                  className={`relative w-32 h-32 rounded-full flex items-center justify-center ${getTrustBgColor(
                    application.trust_score
                  )}`}
                >
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">
                      {application.trust_score}
                    </p>
                    <p className="text-sm text-gray-600">/100</p>
                  </div>
                </div>
              </div>

              <p className={`text-center font-semibold ${getTrustColor(application.trust_score)}`}>
                Good Trust Score
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-900 font-medium mb-3">Application ID:</p>
              <div className="flex items-center justify-between bg-white rounded p-3 border border-blue-200">
                <code className="font-mono text-sm text-gray-600">#TR-{application.id.slice(0, 8)}</code>
                <button
                  onClick={handleCopy}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                >
                  {copied ? <CheckIcon className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-900 font-medium">
                We'll email you within 24 hours with a decision
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Track Status
            </button>

            <button
              onClick={() => navigate('/login')}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              Back to Home
            </button>
          </div>
        )}

        {isDeclined && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <XCircle className="w-24 h-24 text-red-500" />
            </div>

            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Application Not Approved</h1>
              <p className="text-gray-600 text-lg">
                Unfortunately, your application didn't meet our approval criteria at this time.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <p className="text-sm text-gray-600 mb-3">Your Trust Score</p>

              <div className="flex items-center justify-center mb-4">
                <div
                  className={`relative w-32 h-32 rounded-full flex items-center justify-center ${getTrustBgColor(
                    application.trust_score
                  )}`}
                >
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">
                      {application.trust_score}
                    </p>
                    <p className="text-sm text-gray-600">/100</p>
                  </div>
                </div>
              </div>

              <p className={`text-center font-semibold ${getTrustColor(application.trust_score)}`}>
                Trust Score Below Threshold
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-900 font-medium">
                Your trust score is below our minimum threshold of 40
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">How to Improve Your Score</h2>

              <div className="space-y-3">
                {improvementTips.map((tip, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setExpandedTip(expandedTip === index ? null : index)
                    }
                    className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{tip}</span>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          expandedTip === index ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4">
              You can reapply after 30 days
            </p>

            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
            >
              Contact Support
            </button>

            <button
              onClick={() => navigate('/login')}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
