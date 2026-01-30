// Payment API Service
// Handles all payment application-related API calls

import { api } from './api';
import { PaymentApplication, PaymentApplicationData, Customer } from '../types/api';

export const paymentApi = {
  /**
   * Submit a new payment application
   * @param data - Payment application data
   * @returns Created payment application with trust score and status
   */
  async submitApplication(data: PaymentApplicationData): Promise<PaymentApplication> {
    return api.post<PaymentApplication>('/payment-applications', data);
  },

  /**
   * Get payment application by ID
   * @param applicationId - Payment application ID
   * @returns Payment application details
   */
  async getApplicationById(applicationId: string): Promise<PaymentApplication> {
    return api.get<PaymentApplication>(`/payment-applications/${applicationId}`);
  },

  /**
   * Get all payment applications for a business
   * @param businessId - Business ID
   * @param status - Filter by status (optional)
   * @param limit - Number of applications to return (optional)
   * @returns Array of payment applications
   */
  async getBusinessApplications(
    businessId: string,
    status?: 'approved' | 'under_review' | 'declined',
    limit?: number
  ): Promise<PaymentApplication[]> {
    let endpoint = `/businesses/${businessId}/applications?`;

    if (status) {
      endpoint += `status=${status}&`;
    }

    if (limit) {
      endpoint += `limit=${limit}`;
    }

    return api.get<PaymentApplication[]>(endpoint);
  },

  /**
   * Get aggregated customer data for a business
   * @param businessId - Business ID
   * @returns Array of customer summaries
   */
  async getCustomers(businessId: string): Promise<Customer[]> {
    return api.get<Customer[]>(`/businesses/${businessId}/customers`);
  },
};
