import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Upload, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { businessApi } from '../services/businessApi';

interface FormData {
  businessName: string;
  email: string;
  phone: string;
  industry: string;
  password: string;
  confirmPassword: string;
  cacCertificate: File | null;
  otherDocuments: File[];
  verificationCode: string;
  agreedToTerms: boolean;
}

export default function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    email: '',
    phone: '',
    industry: '',
    password: '',
    confirmPassword: '',
    cacCertificate: null,
    otherDocuments: [],
    verificationCode: '',
    agreedToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [verificationCodeInputs, setVerificationCodeInputs] = useState(['', '', '', '', '', '']);

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(070|080|081|090|091)\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must start with 070, 080, 081, 090, or 091 and have 11 digits';
    }

    if (!formData.industry) {
      newErrors.industry = 'Please select an industry';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cacCertificate) {
      newErrors.cacCertificate = 'CAC Certificate is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (file: File, type: 'cac' | 'other') => {
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, file: 'File size must be less than 5MB' });
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, file: 'Only PDF, JPG, and PNG files are allowed' });
      return;
    }

    if (type === 'cac') {
      setFormData({ ...formData, cacCertificate: file });
    } else {
      setFormData({ ...formData, otherDocuments: [...formData.otherDocuments, file] });
    }
    setErrors({ ...errors, file: '', cacCertificate: '' });
  };

  const removeDocument = (index: number) => {
    const newDocs = formData.otherDocuments.filter((_, i) => i !== index);
    setFormData({ ...formData, otherDocuments: newDocs });
  };

  const handleVerificationCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newInputs = [...verificationCodeInputs];
      newInputs[index] = value;
      setVerificationCodeInputs(newInputs);
      setFormData({ ...formData, verificationCode: newInputs.join('') });

      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleResendCode = () => {
    setResendDisabled(true);
    setCountdown(60);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (formData.verificationCode.length === 6) {
        setCurrentStep(4);
      } else {
        setErrors({ verificationCode: 'Please enter the 6-digit code' });
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!formData.agreedToTerms) {
      setErrors({ terms: 'You must agree to the Terms & Conditions' });
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create auth user in Supabase (auth only)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Step 2: Register business through API (will use mock API in development)
        await businessApi.register({
          business_name: formData.businessName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          industry: formData.industry,
          cac_certificate: formData.cacCertificate || undefined,
          additional_documents: formData.otherDocuments && formData.otherDocuments.length > 0 ? formData.otherDocuments : undefined,
        });

        // Also create in Supabase for backward compatibility (until backend is ready)
        const slug = formData.businessName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        await supabase.from('businesses').insert({
          id: authData.user.id,
          business_name: formData.businessName,
          email: formData.email,
          phone: formData.phone,
          industry: formData.industry,
          email_verified: true,
          payment_slug: slug,
        });

        await supabase.from('payment_rules').insert({
          business_id: authData.user.id,
        });

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 1) return 'bg-red-500';
    if (strength === 2) return 'bg-yellow-500';
    if (strength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Business Account</h2>
          <p className="mt-2 text-gray-600">Join TrustRail for secure instalment payments</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step < currentStep
                        ? 'bg-green-500 text-white'
                        : step === currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step < currentStep ? <Check className="w-5 h-5" /> : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span className="w-24 text-center">Basic Info</span>
              <span className="w-24 text-center">Documents</span>
              <span className="w-24 text-center">Verification</span>
              <span className="w-24 text-center">Review</span>
            </div>
          </div>

          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.businessName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your business name"
                />
                {errors.businessName && (
                  <p className="mt-1 text-sm text-red-500">{errors.businessName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="business@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 08012345678"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.industry ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select industry</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Services">Services</option>
                  <option value="Other">Other</option>
                </select>
                {errors.industry && <p className="mt-1 text-sm text-red-500">{errors.industry}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Min 8 characters"
                />
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i < passwordStrength(formData.password)
                              ? getStrengthColor(passwordStrength(formData.password))
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Strength: {getStrengthText(passwordStrength(formData.password))}
                    </p>
                  </div>
                )}
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Re-enter password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Business Documents</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CAC Certificate <span className="text-red-500">*</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    errors.cacCertificate ? 'border-red-500' : 'border-gray-300'
                  } hover:border-blue-500 transition-colors`}
                >
                  {!formData.cacCertificate ? (
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Drag and drop or</p>
                      <label className="mt-2 inline-block">
                        <span className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600">
                          Click to browse
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'cac');
                          }}
                        />
                      </label>
                      <p className="mt-2 text-xs text-gray-500">PDF, JPG, PNG (max 5MB)</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded">
                      <div className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-green-500" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">
                            {formData.cacCertificate.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(formData.cacCertificate.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFormData({ ...formData, cacCertificate: null })}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
                {errors.cacCertificate && (
                  <p className="mt-1 text-sm text-red-500">{errors.cacCertificate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Documents (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Business License, Tax Clearance, etc.
                </p>
                <div className="border-2 border-dashed rounded-lg p-8 text-center border-gray-300 hover:border-blue-500 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Drag and drop or</p>
                  <label className="mt-2 inline-block">
                    <span className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600">
                      Click to browse
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach((file) => handleFileUpload(file, 'other'));
                      }}
                    />
                  </label>
                  <p className="mt-2 text-xs text-gray-500">PDF, JPG, PNG (max 5MB each)</p>
                </div>

                {formData.otherDocuments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.otherDocuments.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded"
                      >
                        <div className="flex items-center space-x-3">
                          <Check className="h-5 w-5 text-green-500" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeDocument(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Verification</h3>
                <p className="text-gray-600 mb-6">
                  We've sent a verification code to <span className="font-semibold">{formData.email}</span>
                </p>

                <div className="flex justify-center gap-2 mb-6">
                  {verificationCodeInputs.map((value, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength={1}
                      value={value}
                      onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                      className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ))}
                </div>

                {errors.verificationCode && (
                  <p className="text-sm text-red-500 mb-4">{errors.verificationCode}</p>
                )}

                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={handleResendCode}
                    disabled={resendDisabled}
                    className={`text-sm ${
                      resendDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:text-blue-700'
                    }`}
                  >
                    Resend Code
                  </button>
                  {resendDisabled && <span className="text-sm text-gray-500">({countdown}s)</span>}
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Didn't receive code? Check spam folder
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Review & Submit</h3>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Business Name:</span>
                  <span className="font-semibold text-gray-900">{formData.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-gray-900">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold text-gray-900">{formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Industry:</span>
                  <span className="font-semibold text-gray-900">{formData.industry}</span>
                </div>
                <div className="border-t pt-4">
                  <p className="text-gray-600 mb-2">Documents Uploaded:</p>
                  <div className="space-y-1">
                    {formData.cacCertificate && (
                      <div className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-gray-900">{formData.cacCertificate.name}</span>
                      </div>
                    )}
                    {formData.otherDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-gray-900">{doc.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="mt-1 h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-blue-500 hover:text-blue-700">
                    Terms & Conditions
                  </a>
                </label>
              </div>
              {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}
              {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

              <button
                onClick={handleSubmit}
                disabled={loading || !formData.agreedToTerms}
                className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <button
                onClick={() => setCurrentStep(1)}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Edit
              </button>
            </div>
          )}

          {currentStep < 4 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-700 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
