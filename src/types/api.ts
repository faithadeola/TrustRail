// API Types and Interfaces for TrustRail

// ============================================================================
// Payment Application Types
// ============================================================================

export interface PaymentApplicationData {
  business_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_bvn?: string;
  service_description: string;
  payment_type: 'INSTALMENT' | 'SUBSCRIPTION';
  total_amount?: number; // For INSTALMENT
  recurring_amount?: number; // For SUBSCRIPTION
  commitment_months?: number; // For SUBSCRIPTION
  payment_frequency: string;
  preferred_start_date: string;
  bank_name: string;
  account_number: string;
  account_name: string;
}

export interface PaymentApplication extends PaymentApplicationData {
  id: string;
  status: 'approved' | 'under_review' | 'declined';
  trust_score: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Business Types
// ============================================================================

export interface RegisterBusinessData {
  business_name: string;
  email: string;
  phone: string;
  password: string;
  industry: string;
  cac_certificate?: File;
  additional_documents?: File[];
}

export interface Business {
  id: string;
  business_name: string;
  email: string;
  phone: string;
  industry: string;
  payment_slug: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  cac_certificate_url?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Trust Rules Types
// ============================================================================

export interface TrustRulesData {
  id?: string;
  business_id?: string;
  trusted_min: number;
  verified_min: number;
  new_min: number;
  restricted_min: number;
  auto_approve_threshold: number;
  auto_decline_threshold: number;
  max_outstanding_balance: number;
  consecutive_failure_limit: number;
  late_payment_penalty: number;
  on_time_bonus: number;
  min_history_for_trusted: number;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Dashboard Stats Types
// ============================================================================

export interface DashboardStats {
  totalPayments: number;
  successRate: number;
  pendingApprovals: number;
  failedPayments: number;
}

export interface Transaction {
  id: string;
  customer_name: string;
  customer_email: string;
  service_description: string;
  total_amount?: number;
  recurring_amount?: number;
  payment_type: 'INSTALMENT' | 'SUBSCRIPTION';
  status: 'approved' | 'under_review' | 'declined';
  trust_score: number;
  created_at: string;
}

// ============================================================================
// Customer Types
// ============================================================================

export interface Customer {
  customer_email: string;
  customer_name: string;
  total_payments: number;
  successful_payments: number;
  average_trust_score: number;
  total_amount_paid: number;
  active_plans: number;
  last_payment_date: string;
}

// ============================================================================
// Bank Verification Types
// ============================================================================

export interface BankVerificationRequest {
  bank_code: string;
  account_number: string;
}

export interface BankVerificationResponse {
  success: boolean;
  account_name?: string;
  error?: string;
}

// ============================================================================
// Trust Score Types
// ============================================================================

export interface TrustScoreRequest {
  customer_email: string;
  customer_bvn?: string;
  business_id: string;
  total_amount: number;
  payment_type: 'INSTALMENT' | 'SUBSCRIPTION';
}

export interface TrustScoreResponse {
  trust_score: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
  id: string;
  business_id: string;
  type: 'payment_received' | 'trust_score_updated' | 'customer_added' | 'application_approved' | 'application_declined' | 'application_under_review';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  related_id?: string; // ID of related payment application or customer
}
