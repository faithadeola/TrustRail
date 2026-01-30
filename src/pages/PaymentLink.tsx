import { useState, useEffect, useCallback } from 'react';
import { Copy, QrCode, Download, Share2, Edit2, ExternalLink, Check } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { businessApi } from '../services/businessApi';

export default function PaymentLink() {
  const { user } = useAuth();
  const [businessId, setBusinessId] = useState<string>('');
  const [paymentSlug, setPaymentSlug] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [iframeCopied, setIframeCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPaymentLink = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const business = await businessApi.getByEmail(user.email);
      setBusinessId(business.id);
      setPaymentSlug(business.payment_slug || '');
      setNewSlug(business.payment_slug || '');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load payment link';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      loadPaymentLink();
    }
  }, [user?.email, loadPaymentLink]);

  const paymentUrl = `${window.location.origin}/pay/${paymentSlug}`;

  const handleCopy = async (text: string, type: 'link' | 'embed' | 'iframe') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else if (type === 'embed') {
        setEmbedCopied(true);
        setTimeout(() => setEmbedCopied(false), 2000);
      } else if (type === 'iframe') {
        setIframeCopied(true);
        setTimeout(() => setIframeCopied(false), 2000);
      }
      showToastMessage('Copied to clipboard!');
    } catch (err) {
      showToastMessage('Failed to copy');
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleUpdateSlug = async () => {
    if (!businessId || !newSlug) return;

    const sanitizedSlug = newSlug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
      await businessApi.updateSlug(businessId, sanitizedSlug);
      setPaymentSlug(sanitizedSlug);
      setIsEditing(false);
      showToastMessage('Payment link updated successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update link';
      showToastMessage(errorMessage);
    }
  };

  const handleShare = (platform: string) => {
    const text = `Check out our payment portal: ${paymentUrl}`;
    const encodedUrl = encodeURIComponent(paymentUrl);
    const encodedText = encodeURIComponent(text);

    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedText}`,
      email: `mailto:?subject=Payment Link&body=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  };

  const embedCode = `<script src="${window.location.origin}/embed.js"></script>
<div class="trustrail-payment" data-slug="${paymentSlug}"></div>`;

  const iframeCode = `<iframe src="${paymentUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const generateQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentUrl)}`;
    return qrUrl;
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = generateQRCode();
    link.download = `trustrail-qr-${paymentSlug}.png`;
    link.click();
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Your Payment Link"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Payment Link' }]}
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
        title="Your Payment Link"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Payment Link' }]}
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Your Payment Link"
      breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Payment Link' }]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Payment Link</h3>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Your unique payment portal URL</p>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">https://trustrail.com/pay/</span>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your-business-name"
                />
                <button
                  onClick={handleUpdateSlug}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewSlug(paymentSlug);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-xl font-mono font-semibold text-blue-600 break-all">
                  {paymentUrl}
                </p>
                <button
                  onClick={() => handleCopy(paymentUrl, 'link')}
                  className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center space-x-4 py-6 border-t border-gray-200">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <img
                  src={generateQRCode()}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
              <button
                onClick={downloadQRCode}
                className="mt-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Download className="h-5 w-5" />
                <span>Download QR Code</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => window.open(paymentUrl, '_blank')}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <ExternalLink className="h-5 w-5" />
            <span>Preview Payment Portal</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Options</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <Share2 className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">WhatsApp</span>
            </button>

            <button
              onClick={() => handleShare('email')}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Share2 className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Email</span>
            </button>

            <button
              onClick={() => handleShare('twitter')}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-colors"
            >
              <Share2 className="h-8 w-8 text-sky-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Twitter</span>
            </button>

            <button
              onClick={() => handleShare('facebook')}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-700 hover:bg-blue-50 transition-colors"
            >
              <Share2 className="h-8 w-8 text-blue-700 mb-2" />
              <span className="text-sm font-medium text-gray-900">Facebook</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Embed Options</h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">HTML Embed Code</label>
                <button
                  onClick={() => handleCopy(embedCode, 'embed')}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  {embedCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{embedCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-green-400 font-mono whitespace-pre">
                  {embedCode}
                </code>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">iFrame Embed Code</label>
                <button
                  onClick={() => handleCopy(iframeCode, 'iframe')}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  {iframeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{iframeCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-green-400 font-mono whitespace-pre">
                  {iframeCode}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}
    </DashboardLayout>
  );
}
