// Mock API for Development
// Simulates backend responses until real MySQL backend is ready

import {
  Business,
  PaymentApplication,
  PaymentApplicationData,
  TrustRulesData,
  DashboardStats,
  Transaction,
  Customer,
  Notification,
} from '../types/api';

// Storage keys for localStorage
const STORAGE_KEYS = {
  businesses: 'mockApi_businesses',
  applications: 'mockApi_applications',
  trustRules: 'mockApi_trustRules',
  notifications: 'mockApi_notifications',
};

// Helper functions for localStorage persistence
const loadFromLocalStorage = <T>(key: string): Map<string, T> => {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      return new Map(Object.entries(parsed));
    }
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
  }
  return new Map<string, T>();
};

const saveToLocalStorage = <T>(key: string, map: Map<string, T>): void => {
  try {
    const obj = Object.fromEntries(map);
    localStorage.setItem(key, JSON.stringify(obj));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

// Persistent storage for development (survives page reloads)
const storage = {
  businesses: loadFromLocalStorage<Business>(STORAGE_KEYS.businesses),
  applications: loadFromLocalStorage<PaymentApplication>(STORAGE_KEYS.applications),
  trustRules: loadFromLocalStorage<TrustRulesData>(STORAGE_KEYS.trustRules),
  notifications: loadFromLocalStorage<Notification>(STORAGE_KEYS.notifications),
};

/**
 * Calculate mock trust score based on application data
 */
function calculateMockTrustScore(data: PaymentApplicationData): number {
  let score = 50; // Base score

  // BVN provided adds 20 points
  if (data.customer_bvn) score += 20;

  // Lower amounts are less risky
  const amount = data.total_amount || data.recurring_amount || 0;
  if (amount < 50000) score += 20;
  else if (amount < 100000) score += 15;
  else if (amount < 200000) score += 10;

  // Monthly payments are more predictable
  if (data.payment_frequency === 'monthly') score += 10;

  // Random factor (simulating other checks)
  score += Math.floor(Math.random() * 15);

  return Math.min(100, Math.max(0, score));
}

/**
 * Determine approval status based on trust score
 */
function getStatusFromScore(score: number): 'approved' | 'under_review' | 'declined' {
  if (score >= 70) return 'approved';
  if (score >= 40) return 'under_review';
  return 'declined';
}

/**
 * Mock API handler
 */
export const mockApi = {
  async handleRequest(endpoint: string, options: RequestInit): Promise<any> {
    const method = options.method || 'GET';

    // Parse body - handle both JSON and FormData
    let body = null;
    if (options.body) {
      if (options.body instanceof FormData) {
        // Convert FormData to plain object
        body = {};
        options.body.forEach((value, key) => {
          body[key] = value;
        });
      } else {
        body = JSON.parse(options.body as string);
      }
    }

    console.log(`[MOCK API] ${method} ${endpoint}`, body);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    // Route the request
    if (method === 'POST' && endpoint === '/businesses/register') {
      return this.registerBusiness(body);
    }

    if (method === 'GET' && endpoint.startsWith('/businesses/slug/')) {
      const slug = endpoint.split('/').pop();
      return this.getBusinessBySlug(slug!);
    }

    if (method === 'GET' && endpoint.startsWith('/businesses/email/')) {
      const email = decodeURIComponent(endpoint.split('/').pop()!);
      return this.getBusinessByEmail(email);
    }

    if (method === 'GET' && endpoint.match(/\/businesses\/[^/]+$/)) {
      const id = endpoint.split('/').pop();
      return this.getBusinessById(id!);
    }

    if (method === 'PUT' && endpoint.includes('/slug')) {
      const id = endpoint.split('/')[2];
      return this.updateSlug(id, body.slug);
    }

    if (method === 'GET' && endpoint.includes('/stats')) {
      const id = endpoint.split('/')[2];
      return this.getStats(id);
    }

    if (method === 'GET' && endpoint.includes('/transactions')) {
      const id = endpoint.split('/')[2];
      return this.getTransactions(id);
    }

    if (method === 'POST' && endpoint === '/payment-applications') {
      return this.submitApplication(body);
    }

    if (method === 'GET' && endpoint.match(/\/payment-applications\/[^/]+$/)) {
      const id = endpoint.split('/').pop();
      return this.getApplicationById(id!);
    }

    if (method === 'GET' && endpoint.includes('/applications')) {
      const id = endpoint.split('/')[2];
      return this.getBusinessApplications(id);
    }

    if (method === 'GET' && endpoint.includes('/customers')) {
      const id = endpoint.split('/')[2];
      return this.getCustomers(id);
    }

    if (method === 'GET' && endpoint.includes('/trust-rules')) {
      const id = endpoint.split('/')[2];
      return this.getTrustRules(id);
    }

    if (method === 'PUT' && endpoint.includes('/trust-rules')) {
      const id = endpoint.split('/')[2];
      return this.updateTrustRules(id, body);
    }

    if (method === 'GET' && endpoint.includes('/notifications')) {
      const id = endpoint.split('/')[2];
      return this.getNotifications(id);
    }

    if (method === 'PUT' && endpoint.match(/\/notifications\/[^/]+\/read$/)) {
      const notificationId = endpoint.split('/')[2];
      return this.markNotificationAsRead(notificationId);
    }

    throw new Error(`Mock API: Unknown endpoint ${method} ${endpoint}`);
  },

  // Business endpoints
  registerBusiness(data: any): Business {
    const business: Business = {
      id: crypto.randomUUID(),
      business_name: data.business_name,
      email: data.email,
      phone: data.phone,
      industry: data.industry,
      payment_slug: data.business_name.toLowerCase().replace(/\s+/g, '-'),
      verification_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    storage.businesses.set(business.id, business);
    saveToLocalStorage(STORAGE_KEYS.businesses, storage.businesses);

    // Create default trust rules
    const defaultRules: TrustRulesData = {
      business_id: business.id,
      trusted_min: 80,
      verified_min: 60,
      new_min: 40,
      restricted_min: 20,
      auto_approve_threshold: 70,
      auto_decline_threshold: 30,
      max_outstanding_balance: 1000000,
      consecutive_failure_limit: 3,
      late_payment_penalty: 5,
      on_time_bonus: 3,
      min_history_for_trusted: 6,
    };

    storage.trustRules.set(business.id, defaultRules);
    saveToLocalStorage(STORAGE_KEYS.trustRules, storage.trustRules);

    return business;
  },

  getBusinessBySlug(slug: string): Business {
    const business = Array.from(storage.businesses.values()).find(
      (b) => b.payment_slug === slug
    );

    if (!business) {
      throw new Error('Business not found');
    }

    return business;
  },

  getBusinessByEmail(email: string): Business {
    const business = Array.from(storage.businesses.values()).find(
      (b) => b.email === email
    );

    if (!business) {
      throw new Error('Business not found');
    }

    return business;
  },

  getBusinessById(id: string): Business {
    const business = storage.businesses.get(id);

    if (!business) {
      throw new Error('Business not found');
    }

    return business;
  },

  updateSlug(businessId: string, newSlug: string): { success: boolean } {
    const business = storage.businesses.get(businessId);

    if (!business) {
      throw new Error('Business not found');
    }

    business.payment_slug = newSlug;
    business.updated_at = new Date().toISOString();
    saveToLocalStorage(STORAGE_KEYS.businesses, storage.businesses);

    return { success: true };
  },

  getStats(businessId: string): DashboardStats {
    const applications = Array.from(storage.applications.values()).filter(
      (app) => app.business_id === businessId
    );

    const totalPayments = applications.length;
    const approved = applications.filter((app) => app.status === 'approved').length;
    const pending = applications.filter((app) => app.status === 'under_review').length;
    const failed = applications.filter((app) => app.status === 'declined').length;

    return {
      totalPayments,
      successRate: totalPayments > 0 ? Math.round((approved / totalPayments) * 100) : 0,
      pendingApprovals: pending,
      failedPayments: failed,
    };
  },

  getTransactions(businessId: string): Transaction[] {
    return Array.from(storage.applications.values())
      .filter((app) => app.business_id === businessId)
      .slice(0, 5)
      .map((app) => ({
        id: app.id,
        customer_name: app.customer_name,
        customer_email: app.customer_email,
        service_description: app.service_description,
        total_amount: app.total_amount,
        recurring_amount: app.recurring_amount,
        payment_type: app.payment_type,
        status: app.status,
        trust_score: app.trust_score,
        created_at: app.created_at,
      }));
  },

  // Payment application endpoints
  submitApplication(data: PaymentApplicationData): PaymentApplication {
    const trustScore = calculateMockTrustScore(data);
    const status = getStatusFromScore(trustScore);

    const application: PaymentApplication = {
      id: crypto.randomUUID(),
      ...data,
      status,
      trust_score: trustScore,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    storage.applications.set(application.id, application);
    saveToLocalStorage(STORAGE_KEYS.applications, storage.applications);

    // Create notification for the business
    this.createNotification(application);

    return application;
  },

  createNotification(application: PaymentApplication): void {
    const notification: Notification = {
      id: crypto.randomUUID(),
      business_id: application.business_id,
      type: application.status === 'approved' ? 'application_approved' :
            application.status === 'declined' ? 'application_declined' : 'application_under_review',
      title: application.status === 'approved' ? 'Application Approved' :
             application.status === 'declined' ? 'Application Declined' : 'Application Under Review',
      message: `Payment application from ${application.customer_name} is ${application.status.replace('_', ' ')}`,
      read: false,
      created_at: new Date().toISOString(),
      related_id: application.id,
    };

    storage.notifications.set(notification.id, notification);
    saveToLocalStorage(STORAGE_KEYS.notifications, storage.notifications);
  },

  getApplicationById(id: string): PaymentApplication {
    const application = storage.applications.get(id);

    if (!application) {
      throw new Error('Payment application not found');
    }

    return application;
  },

  getBusinessApplications(businessId: string): PaymentApplication[] {
    return Array.from(storage.applications.values())
      .filter((app) => app.business_id === businessId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getCustomers(businessId: string): Customer[] {
    const applications = Array.from(storage.applications.values()).filter(
      (app) => app.business_id === businessId
    );

    const customerMap = new Map<string, Customer>();

    applications.forEach((app) => {
      const existing = customerMap.get(app.customer_email);

      if (existing) {
        existing.total_payments++;
        if (app.status === 'approved') existing.successful_payments++;
        existing.average_trust_score =
          (existing.average_trust_score * (existing.total_payments - 1) + app.trust_score) /
          existing.total_payments;
        existing.total_amount_paid += app.total_amount || app.recurring_amount || 0;
        if (new Date(app.created_at) > new Date(existing.last_payment_date)) {
          existing.last_payment_date = app.created_at;
        }
      } else {
        customerMap.set(app.customer_email, {
          customer_email: app.customer_email,
          customer_name: app.customer_name,
          total_payments: 1,
          successful_payments: app.status === 'approved' ? 1 : 0,
          average_trust_score: app.trust_score,
          total_amount_paid: app.total_amount || app.recurring_amount || 0,
          active_plans: app.status === 'approved' ? 1 : 0,
          last_payment_date: app.created_at,
        });
      }
    });

    return Array.from(customerMap.values());
  },

  // Trust rules endpoints
  getTrustRules(businessId: string): TrustRulesData {
    let rules = storage.trustRules.get(businessId);

    if (!rules) {
      // Create default rules if none exist
      rules = {
        business_id: businessId,
        trusted_min: 80,
        verified_min: 60,
        new_min: 40,
        restricted_min: 20,
        auto_approve_threshold: 70,
        auto_decline_threshold: 30,
        max_outstanding_balance: 1000000,
        consecutive_failure_limit: 3,
        late_payment_penalty: 5,
        on_time_bonus: 3,
        min_history_for_trusted: 6,
      };
      storage.trustRules.set(businessId, rules);
      saveToLocalStorage(STORAGE_KEYS.trustRules, storage.trustRules);
    }

    return rules;
  },

  updateTrustRules(businessId: string, rules: TrustRulesData): { success: boolean } {
    storage.trustRules.set(businessId, {
      ...rules,
      business_id: businessId,
      updated_at: new Date().toISOString(),
    });
    saveToLocalStorage(STORAGE_KEYS.trustRules, storage.trustRules);

    return { success: true };
  },

  // Notification endpoints
  getNotifications(businessId: string): Notification[] {
    return Array.from(storage.notifications.values())
      .filter((notification) => notification.business_id === businessId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  markNotificationAsRead(notificationId: string): { success: boolean } {
    const notification = storage.notifications.get(notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.read = true;
    storage.notifications.set(notificationId, notification);
    saveToLocalStorage(STORAGE_KEYS.notifications, storage.notifications);

    return { success: true };
  },
};
