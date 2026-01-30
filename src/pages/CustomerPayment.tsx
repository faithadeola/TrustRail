import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Check, Shield, Lock, ChevronDown, Calendar, RefreshCw, ArrowLeft } from 'lucide-react';
import { businessApi } from '../services/businessApi';
import { paymentApi } from '../services/paymentApi';
import { PaymentApplicationData } from '../types/api';

interface FormData {
  // Personal Info
  fullName: string;
  email: string;
  phone: string;
  bvn: string;
  
  // Payment Details
  serviceDescription: string;
  totalAmount: string;          // For INSTALMENT only
  recurringAmount: string;      // For SUBSCRIPTION only
  commitmentMonths: number;     // For SUBSCRIPTION only
  paymentFrequency: 'monthly' | 'biweekly' | 'weekly' | 'daily';
  preferredStartDate: string;
  
  // Bank Details
  bankName: string;
  accountNumber: string;
  accountName: string;
  
  // Terms
  agreedToTerms: boolean;
  agreedToDebit: boolean;
}

interface Business {
  id: string;
  business_name: string;
  email: string;
  industry: string;
  logo_url?: string;
}

interface PaymentRules {
  min_order_value: number;
  max_instalment_period: number;
  down_payment_percentage: number;
  enable_fees: boolean;
  interest_rate: number;
}

const BANKS = [
  'Access Bank',
  'GTBank',
  'Zenith Bank',
  'First Bank',
  'UBA',
  'FCMB',
  'Wema Bank',
  'Stanbic IBTC',
  'Union Bank',
  'Sterling Bank',
];

export default function CustomerPayment() {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get payment type from navigation state
  const paymentType = (location.state?.paymentType as 'INSTALMENT' | 'SUBSCRIPTION') || 'INSTALMENT';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [business, setBusiness] = useState<Business | null>(null);
  const [paymentRules, setPaymentRules] = useState<PaymentRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [bankSearchOpen, setBankSearchOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [verifyingBank, setVerifyingBank] = useState(false);
  const [bankVerified, setBankVerified] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    bvn: '',
    serviceDescription: '',
    totalAmount: '',
    recurringAmount: '',
    commitmentMonths: 0,
    paymentFrequency: 'monthly',
    preferredStartDate: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    agreedToTerms: false,
    agreedToDebit: false,
  });

  useEffect(() => {
    loadBusinessData();
    setDefaultStartDate();
  }, [businessSlug]);

  const setDefaultStartDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData((prev) => ({
      ...prev,
      preferredStartDate: tomorrow.toISOString().split('T')[0],
    }));
  };

  const loadBusinessData = async () => {
    if (!businessSlug) return;

    try {
      const businessData = await businessApi.getBySlug(businessSlug);
      setBusiness(businessData);

      // Load payment rules (for schedule calculation)
      try {
        const rulesData = await businessApi.getById(businessData.id);
        // Note: Rules should be fetched from trustRulesApi but keeping simple for now
        // Backend can include rules in business response if needed
      } catch (rulesErr) {
        console.error('Could not load payment rules:', rulesErr);
      }
    } catch (error) {
      console.error('Error loading business data:', error);
    }

    setLoading(false);
  };

  // VALIDATION FUNCTIONS
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (formData.bvn && !/^\d{11}$/.test(formData.bvn.replace(/\D/g, ''))) {
      newErrors.bvn = 'BVN must be 11 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceDescription.trim()) {
      newErrors.serviceDescription = 'Service description is required';
    }

    if (paymentType === 'INSTALMENT') {
      if (!formData.totalAmount) {
        newErrors.totalAmount = 'Total amount is required';
      } else if (Number(formData.totalAmount) <= 0) {
        newErrors.totalAmount = 'Amount must be greater than 0';
      } else if (paymentRules && Number(formData.totalAmount) < paymentRules.min_order_value) {
        newErrors.totalAmount = `Minimum amount is ₦${paymentRules.min_order_value.toLocaleString()}`;
      }
    }

    if (paymentType === 'SUBSCRIPTION') {
      if (!formData.recurringAmount) {
        newErrors.recurringAmount = 'Monthly amount is required';
      } else if (Number(formData.recurringAmount) <= 0) {
        newErrors.recurringAmount = 'Amount must be greater than 0';
      } else if (Number(formData.recurringAmount) < 5000) {
        newErrors.recurringAmount = 'Minimum subscription amount is ₦5,000';
      }
    }

    if (!formData.preferredStartDate) {
      newErrors.preferredStartDate = 'Please select a start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankName) {
      newErrors.bankName = 'Please select a bank';
    }
    
    if (!formData.accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{10}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account number must be 10 digits';
    }
    
    if (!formData.accountName) {
      newErrors.accountName = 'Please verify your account number';
    }

    if (!formData.agreedToDebit) {
      newErrors.agreedToDebit = 'You must authorize account debits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // HANDLERS
  const handleBvnChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    setFormData({ ...formData, bvn: cleaned });
  };

  const handleVerifyBank = async () => {
    if (!/^\d{10}$/.test(formData.accountNumber)) {
      setErrors({ ...errors, accountNumber: 'Account number must be 10 digits' });
      return;
    }

    setVerifyingBank(true);
    
    // Simulate API call - Replace with actual bank verification API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock account name - Replace with actual API response
    const mockAccountName = formData.fullName || 'Account Holder Name';
    setFormData({ ...formData, accountName: mockAccountName });
    setBankVerified(true);
    setVerifyingBank(false);
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!formData.agreedToTerms) {
      setErrors({ ...errors, terms: 'You must agree to the terms and conditions' });
      return;
    }
    if (!business) return;

    setSubmitting(true);
    setErrors({});

    try {
      // Build properly typed payload
      const payload: PaymentApplicationData = {
        business_id: business.id,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_bvn: formData.bvn || undefined,
        service_description: formData.serviceDescription,
        payment_type: paymentType,
        payment_frequency: formData.paymentFrequency,
        preferred_start_date: formData.preferredStartDate,
        bank_name: formData.bankName,
        account_number: formData.accountNumber,
        account_name: formData.accountName,
      };

      // Add amount fields based on payment type
      if (paymentType === 'INSTALMENT') {
        payload.total_amount = Number(formData.totalAmount);
      } else if (paymentType === 'SUBSCRIPTION') {
        payload.recurring_amount = Number(formData.recurringAmount);
        payload.commitment_months = Number(formData.commitmentMonths);
      }

      // Submit to backend API (trust score calculated by backend)
      const result = await paymentApi.submitApplication(payload);

      // Navigate to result page with application data
      navigate(`/pay/${businessSlug}/result/${result.id}`, {
        state: { application: result },
      });
    } catch (err: any) {
      console.error('Payment application submission error:', err);
      setErrors({
        submit: err.message || 'Failed to submit application. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // PAYMENT SCHEDULE CALCULATION (for INSTALMENT)
  const getInstalmentSchedule = () => {
    if (paymentType !== 'INSTALMENT' || !formData.totalAmount || !paymentRules) {
      return null;
    }

    const amount = Number(formData.totalAmount);
    const downPaymentPercent = paymentRules.down_payment_percentage;
    const downPayment = (amount * downPaymentPercent) / 100;
    const remaining = amount - downPayment;
    const numInstalments = paymentRules.max_instalment_period;

    const monthlyInterest = paymentRules.enable_fees ? (remaining * paymentRules.interest_rate) / 100 : 0;
    const totalInterest = monthlyInterest * numInstalments;
    const totalWithInterest = remaining + totalInterest;
    const installmentAmount = totalWithInterest / numInstalments;

    const startDate = new Date(formData.preferredStartDate);
    const schedule = [];

    // Determine interval in days based on frequency
    let intervalDays = 30;
    switch (formData.paymentFrequency) {
      case 'biweekly':
        intervalDays = 14;
        break;
      case 'weekly':
        intervalDays = 7;
        break;
      case 'daily':
        intervalDays = 1;
        break;
      case 'monthly':
      default:
        intervalDays = 30;
        break;
    }

    for (let i = 1; i <= numInstalments; i++) {
      const paymentDate = new Date(startDate);
      if (formData.paymentFrequency === 'monthly') {
        paymentDate.setMonth(startDate.getMonth() + i - 1);
      } else {
        paymentDate.setDate(startDate.getDate() + intervalDays * (i - 1));
      }
      schedule.push({
        number: i,
        date: paymentDate,
        amount: installmentAmount,
      });
    }

    return {
      downPayment,
      installmentAmount,
      numInstalments,
      totalInterest,
      total: amount + totalInterest,
      schedule,
    };
  };

  const instalmentSchedule = getInstalmentSchedule();
  const filteredBanks = BANKS.filter((bank) =>
    bank.toLowerCase().includes(bankSearch.toLowerCase())
  );

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment portal...</p>
        </div>
      </div>
    );
  }

  // NOT FOUND STATE
  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h1>
          <p className="text-gray-600 mb-6">
            The payment link you're looking for doesn't exist or has been disabled.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // MAIN RENDER
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER WITH BUSINESS BRANDING */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {business.logo_url ? (
                <img
                  src={business.logo_url}
                  alt={business.business_name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{business.business_name}</h1>
                <p className="text-sm text-gray-600">Secure Payment Portal</p>
              </div>
            </div>
          </div>

          {/* PAYMENT TYPE BADGE */}
          <div className={`rounded-lg p-4 border-2 ${
            paymentType === 'INSTALMENT'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {paymentType === 'INSTALMENT' ? (
                  <Calendar className="h-6 w-6 text-blue-600" />
                ) : (
                  <RefreshCw className="h-6 w-6 text-purple-600" />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      paymentType === 'INSTALMENT'
                        ? 'bg-blue-500 text-white'
                        : 'bg-purple-500 text-white'
                    }`}>
                      {paymentType === 'INSTALMENT' ? '📊 Instalment Plan' : '🔄 Recurring Subscription'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {paymentType === 'INSTALMENT'
                      ? 'Split your payment into manageable instalments'
                      : 'Set up automatic monthly subscription payments'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/pay/${businessSlug}`)}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Change</span>
              </button>
            </div>
          </div>

          {/* TRUST BADGES */}
          <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Instant Approval</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>No Hidden Fees</span>
            </div>
          </div>
        </div>

        {/* PROGRESS INDICATOR */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step < currentStep
                      ? 'bg-green-500 text-white'
                      : step === currentStep
                      ? 'bg-blue-500 text-white ring-4 ring-blue-200'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step < currentStep ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 px-2">
            <span>Personal Info</span>
            <span>Payment Details</span>
            <span>Bank Account</span>
            <span>Review & Submit</span>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - FORM */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              
              {/* STEP 1: PERSONAL INFORMATION */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
                    <p className="text-gray-600">Tell us about yourself</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+234 80 1234 5678"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      BVN (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.bvn}
                      onChange={(e) => handleBvnChange(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        errors.bvn ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="12345678901"
                      maxLength={11}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Providing your BVN may improve your approval chances
                    </p>
                    {errors.bvn && (
                      <p className="mt-1 text-sm text-red-500">{errors.bvn}</p>
                    )}
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                    <Lock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Your data is secure</p>
                      <p className="text-xs text-green-700 mt-1">
                        All information is encrypted and protected with bank-level security
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PAYMENT DETAILS */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Details</h2>
                    <p className="text-gray-600">
                      {paymentType === 'INSTALMENT'
                        ? 'Tell us what you need to pay for'
                        : 'Set up your subscription'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service/Product Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.serviceDescription}
                      onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        errors.serviceDescription ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={
                        paymentType === 'INSTALMENT'
                          ? 'e.g., Medical Scan, School Fees, Laptop'
                          : 'e.g., Gym Membership, Online Classes, Health Plan'
                      }
                    />
                    {errors.serviceDescription && (
                      <p className="mt-1 text-sm text-red-500">{errors.serviceDescription}</p>
                    )}
                  </div>

                  {/* INSTALMENT: Total Amount */}
                  {paymentType === 'INSTALMENT' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Amount to Split <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
                          ₦
                        </span>
                        <input
                          type="number"
                          value={formData.totalAmount}
                          onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                            errors.totalAmount ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="150000"
                          min="0"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        This amount will be split into {paymentRules?.max_instalment_period || 6} instalments
                      </p>
                      {errors.totalAmount && (
                        <p className="mt-1 text-sm text-red-500">{errors.totalAmount}</p>
                      )}
                    </div>
                  )}

                  {/* SUBSCRIPTION: Monthly Amount */}
                  {paymentType === 'SUBSCRIPTION' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monthly Subscription Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
                            ₦
                          </span>
                          <input
                            type="number"
                            value={formData.recurringAmount}
                            onChange={(e) => setFormData({ ...formData, recurringAmount: e.target.value })}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                              errors.recurringAmount ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="25000"
                            min="0"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          This amount will be charged automatically every month
                        </p>
                        {errors.recurringAmount && (
                          <p className="mt-1 text-sm text-red-500">{errors.recurringAmount}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Commitment Period
                        </label>
                        <select
                          value={formData.commitmentMonths}
                          onChange={(e) => setFormData({ ...formData, commitmentMonths: Number(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        >
                          <option value="0">No minimum - Cancel anytime</option>
                          <option value="3">3 months minimum</option>
                          <option value="6">6 months minimum</option>
                          <option value="12">12 months minimum</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          {formData.commitmentMonths === 0
                            ? 'You can cancel your subscription at any time'
                            : `After ${formData.commitmentMonths} months, you can cancel anytime`
                          }
                        </p>
                      </div>
                    </>
                  )}

                  {/* Payment Frequency - Only for INSTALMENT */}
                  {paymentType === 'INSTALMENT' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Payment Frequency
                      </label>
                      <div className="space-y-3">
                        {[
                          { value: 'monthly' as const, label: 'Monthly', desc: 'Pay once per month', recommended: true },
                          { value: 'biweekly' as const, label: 'Bi-weekly', desc: 'Pay every 2 weeks', recommended: false },
                          { value: 'weekly' as const, label: 'Weekly', desc: 'Pay every week', recommended: false },
                          { value: 'daily' as const, label: 'Daily', desc: 'Pay every day', recommended: false },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.paymentFrequency === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="frequency"
                              value={option.value}
                              checked={formData.paymentFrequency === option.value}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  paymentFrequency: e.target.value as 'monthly' | 'biweekly' | 'weekly' | 'daily',
                                })
                              }
                              className="w-5 h-5 text-blue-500"
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">{option.label}</span>
                                {option.recommended && (
                                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                    Recommended
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-0.5">{option.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {paymentType === 'INSTALMENT' ? 'Preferred Start Date' : 'Subscription Start Date'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.preferredStartDate}
                      onChange={(e) => setFormData({ ...formData, preferredStartDate: e.target.value })}
                      min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        errors.preferredStartDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.preferredStartDate && (
                      <p className="mt-1 text-sm text-red-500">{errors.preferredStartDate}</p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: BANK ACCOUNT */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Bank Account</h2>
                    <p className="text-gray-600">Link your bank account for automatic payments</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Bank <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setBankSearchOpen(!bankSearchOpen)}
                        className={`w-full px-4 py-3 border rounded-lg text-left flex justify-between items-center transition ${
                          errors.bankName ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span className={formData.bankName ? 'text-gray-900' : 'text-gray-400'}>
                          {formData.bankName || 'Choose your bank...'}
                        </span>
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${
                          bankSearchOpen ? 'rotate-180' : ''
                        }`} />
                      </button>

                      {bankSearchOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-hidden">
                          <div className="p-2 border-b border-gray-200">
                            <input
                              type="text"
                              placeholder="Search banks..."
                              value={bankSearch}
                              onChange={(e) => setBankSearch(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredBanks.map((bank) => (
                              <button
                                key={bank}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, bankName: bank, accountName: '' });
                                  setBankSearchOpen(false);
                                  setBankSearch('');
                                  setBankVerified(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors"
                              >
                                {bank}
                              </button>
                            ))}
                            {filteredBanks.length === 0 && (
                              <div className="px-4 py-3 text-center text-gray-500">
                                No banks found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.bankName && (
                      <p className="mt-1 text-sm text-red-500">{errors.bankName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData({ ...formData, accountNumber: cleaned, accountName: '' });
                          setBankVerified(false);
                        }}
                        onBlur={handleVerifyBank}
                        className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                          errors.accountNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0123456789"
                        maxLength={10}
                      />
                      {verifyingBank && (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      )}
                      {bankVerified && !verifyingBank && (
                        <Check className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Account will be verified automatically
                    </p>
                    {errors.accountNumber && (
                      <p className="mt-1 text-sm text-red-500">{errors.accountNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={formData.accountName}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      placeholder="Verification pending..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Auto-filled after account verification
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="consent"
                        checked={formData.agreedToDebit}
                        onChange={(e) => setFormData({ ...formData, agreedToDebit: e.target.checked })}
                        className="mt-1 h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="consent" className="text-sm text-gray-700">
                        I authorize <span className="font-semibold">TrustRail</span> and{' '}
                        <span className="font-semibold">{business.business_name}</span> to debit my account{' '}
                        {paymentType === 'INSTALMENT' ? 'for instalment payments' : 'for recurring subscription payments'}
                      </label>
                    </div>
                    {errors.agreedToDebit && (
                      <p className="mt-2 text-sm text-red-500">{errors.agreedToDebit}</p>
                    )}
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Bank-level security</p>
                      <p className="text-xs text-green-700 mt-1">
                        Your bank details are encrypted and never stored on our servers
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & SUBMIT */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Application</h2>
                    <p className="text-gray-600">Please review your information before submitting</p>
                  </div>

                  {/* Personal Information Summary */}
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900">Personal Information</h3>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium text-gray-900">{formData.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-900">{formData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium text-gray-900">{formData.phone}</span>
                      </div>
                      {formData.bvn && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">BVN:</span>
                          <span className="font-medium text-gray-900">****{formData.bvn.slice(-4)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Plan Summary */}
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {paymentType === 'INSTALMENT' ? 'Payment Plan' : 'Subscription Plan'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service:</span>
                        <span className="font-medium text-gray-900">{formData.serviceDescription}</span>
                      </div>
                      {paymentType === 'INSTALMENT' ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-medium text-gray-900">
                              ₦{Number(formData.totalAmount).toLocaleString()}
                            </span>
                          </div>
                          {instalmentSchedule && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Down Payment:</span>
                                <span className="font-medium text-gray-900">
                                  ₦{instalmentSchedule.downPayment.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Instalments:</span>
                                <span className="font-medium text-gray-900">
                                  {instalmentSchedule.numInstalments}x ₦
                                  {Math.round(instalmentSchedule.installmentAmount).toLocaleString()}
                                </span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Frequency:</span>
                            <span className="font-medium text-gray-900 capitalize">
                              {formData.paymentFrequency}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Monthly Subscription Amount <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
                                ₦
                              </span>
                              <input
                                type="number"
                                value={formData.recurringAmount}
                                onChange={(e) => setFormData({ ...formData, recurringAmount: e.target.value })}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                                  errors.recurringAmount ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="25000"
                                min="0"
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              This amount will be charged automatically every month
                            </p>
                            {errors.recurringAmount && (
                              <p className="mt-1 text-sm text-red-500">{errors.recurringAmount}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Minimum Commitment Period
                            </label>
                            <select
                              value={formData.commitmentMonths}
                              onChange={(e) => setFormData({ ...formData, commitmentMonths: Number(e.target.value) })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            >
                              <option value="0">No minimum - Cancel anytime</option>
                              <option value="3">3 months minimum</option>
                              <option value="6">6 months minimum</option>
                              <option value="12">12 months minimum</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                              {formData.commitmentMonths === 0
                                ? 'You can cancel your subscription at any time'
                                : `After ${formData.commitmentMonths} months, you can cancel anytime`
                              }
                            </p>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(formData.preferredStartDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bank Account Summary */}
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900">Bank Account</h3>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium text-gray-900">{formData.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-medium text-gray-900">{formData.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Name:</span>
                        <span className="font-medium text-gray-900">{formData.accountName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={formData.agreedToTerms}
                        onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                        className="mt-1 h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700">
                        I agree to the <button type="button" className="text-blue-600 hover:underline">terms and conditions</button>{' '}
                        and authorize automatic payments according to the schedule above
                      </label>
                    </div>
                    {errors.terms && (
                      <p className="mt-2 text-sm text-red-500">{errors.terms}</p>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-700">{errors.submit}</p>
                    </div>
                  )}
                </div>
              )}

              {/* NAVIGATION BUTTONS */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  ← Back
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition shadow-lg hover:shadow-xl"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !formData.agreedToTerms}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
                  >
                    {submitting ? (
                      <span className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </span>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - PREVIEW SIDEBAR (Step 2 only) */}
          {currentStep === 2 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {paymentType === 'INSTALMENT' ? 'Payment Schedule' : 'Subscription Details'}
                </h3>

                {/* INSTALMENT PREVIEW */}
                {paymentType === 'INSTALMENT' && instalmentSchedule && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
                      <p className="text-xs opacity-90 mb-1">Down Payment</p>
                      <p className="text-3xl font-bold">
                        ₦{instalmentSchedule.downPayment.toLocaleString()}
                      </p>
                      <p className="text-xs opacity-75 mt-1">Due on start date</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-2">Monthly Instalments</p>
                      <p className="text-xl font-bold text-gray-900">
                        {instalmentSchedule.numInstalments}x ₦
                        {Math.round(instalmentSchedule.installmentAmount).toLocaleString()}
                      </p>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-xs text-gray-600 mb-3">Payment Dates</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {instalmentSchedule.schedule.slice(0, 6).map((payment) => (
                          <div key={payment.number} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {payment.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="font-semibold text-gray-900">
                              ₦{Math.round(payment.amount).toLocaleString()}
                            </span>
                          </div>
                        ))}
                        {instalmentSchedule.schedule.length > 6 && (
                          <p className="text-xs text-gray-500 text-center pt-2">
                            +{instalmentSchedule.schedule.length - 6} more payments
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-xl font-bold text-gray-900">
                          ₦{instalmentSchedule.total.toLocaleString()}
                        </span>
                      </div>
                      {instalmentSchedule.totalInterest > 0 && (
                        <p className="text-xs text-gray-500">
                          Includes ₦{Math.round(instalmentSchedule.totalInterest).toLocaleString()} in interest
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* SUBSCRIPTION PREVIEW */}
                {paymentType === 'SUBSCRIPTION' && !!formData.recurringAmount && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4">
                      <p className="text-xs opacity-90 mb-1">Monthly Payment</p>
                      <p className="text-3xl font-bold">
                        ₦{Number(formData.recurringAmount).toLocaleString()}
                      </p>
                      <p className="text-xs opacity-75 mt-1">Charged automatically</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">Billing Frequency</p>
                      <p className="text-sm font-semibold text-gray-900">Every month</p>
                    </div>

                    {formData.preferredStartDate && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">First Payment</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(formData.preferredStartDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    )}

                    {formData.commitmentMonths > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">Minimum Commitment</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formData.commitmentMonths} months
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Total: ₦{(Number(formData.recurringAmount) * formData.commitmentMonths).toLocaleString()}
                        </p>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2 text-green-600">
                          <Check className="h-4 w-4" />
                          <span>Automatic monthly renewal</span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-600">
                          <Check className="h-4 w-4" />
                          <span>
                            {formData.commitmentMonths === 0
                              ? 'Cancel anytime'
                              : `Cancel after ${formData.commitmentMonths} months`
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-600">
                          <Check className="h-4 w-4" />
                          <span>Manage from dashboard</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {paymentType === 'SUBSCRIPTION' && !formData.recurringAmount && (
                  <div className="text-center py-12 text-gray-400">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Enter monthly amount to see details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}