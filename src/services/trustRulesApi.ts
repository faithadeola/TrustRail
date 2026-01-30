// Trust Rules API Service
// Handles trust rules configuration API calls

import { api } from './api';
import { TrustRulesData } from '../types/api';

export const trustRulesApi = {
  /**
   * Get trust rules for a business
   * @param businessId - Business ID
   * @returns Trust rules configuration
   */
  async getRules(businessId: string): Promise<TrustRulesData> {
    return api.get<TrustRulesData>(`/businesses/${businessId}/trust-rules`);
  },

  /**
   * Update trust rules for a business
   * @param businessId - Business ID
   * @param rules - Trust rules data
   * @returns Success response
   */
  async updateRules(businessId: string, rules: TrustRulesData): Promise<{ success: boolean }> {
    return api.put<{ success: boolean }>(`/businesses/${businessId}/trust-rules`, rules);
  },
};
