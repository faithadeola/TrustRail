// Business API Service
// Handles all business-related API calls

import { api } from './api';
import { Business, RegisterBusinessData, DashboardStats, Transaction, Notification } from '../types/api';

export const businessApi = {
  /**
   * Register a new business
   * @param data - Business registration data
   * @returns Created business with auth token
   */
  async register(data: RegisterBusinessData): Promise<Business & { token?: string }> {
    const formData = new FormData();
    formData.append('business_name', data.business_name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('password', data.password);
    formData.append('industry', data.industry);

    if (data.cac_certificate) {
      formData.append('cac_certificate', data.cac_certificate);
    }

    if (data.additional_documents) {
      data.additional_documents.forEach((doc, index) => {
        formData.append(`additional_document_${index}`, doc);
      });
    }

    return api.postFormData<Business & { token?: string }>('/businesses/register', formData);
  },

  /**
   * Get business by ID
   * @param businessId - Business ID
   * @returns Business data
   */
  async getById(businessId: string): Promise<Business> {
    return api.get<Business>(`/businesses/${businessId}`);
  },

  /**
   * Get business by email
   * @param email - Business email
   * @returns Business data
   */
  async getByEmail(email: string): Promise<Business> {
    return api.get<Business>(`/businesses/email/${email}`);
  },

  /**
   * Get business by payment slug
   * @param slug - Payment slug
   * @returns Business data
   */
  async getBySlug(slug: string): Promise<Business> {
    return api.get<Business>(`/businesses/slug/${slug}`);
  },

  /**
   * Update business payment slug
   * @param businessId - Business ID
   * @param newSlug - New payment slug
   * @returns Success response
   */
  async updateSlug(businessId: string, newSlug: string): Promise<{ success: boolean }> {
    return api.put(`/businesses/${businessId}/slug`, { slug: newSlug });
  },

  /**
   * Get business dashboard statistics
   * @param businessId - Business ID
   * @returns Dashboard stats
   */
  async getStats(businessId: string): Promise<DashboardStats> {
    return api.get<DashboardStats>(`/businesses/${businessId}/stats`);
  },

  /**
   * Get recent transactions for business
   * @param businessId - Business ID
   * @param limit - Number of transactions to return (default: 5)
   * @returns Array of transactions
   */
  async getTransactions(businessId: string, limit: number = 5): Promise<Transaction[]> {
    return api.get<Transaction[]>(`/businesses/${businessId}/transactions?limit=${limit}`);
  },

  /**
   * Get notifications for business
   * @param businessId - Business ID
   * @returns Array of notifications
   */
  async getNotifications(businessId: string): Promise<Notification[]> {
    return api.get<Notification[]>(`/businesses/${businessId}/notifications`);
  },

  /**
   * Mark a notification as read
   * @param notificationId - Notification ID
   * @returns Success response
   */
  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
    return api.put(`/notifications/${notificationId}/read`, {});
  },
};
