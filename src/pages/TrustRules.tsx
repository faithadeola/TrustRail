import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, TrendingUp, Shield, AlertTriangle, Users } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { businessApi } from '../services/businessApi';
import { trustRulesApi } from '../services/trustRulesApi';
import { TrustRulesData as ApiTrustRulesData } from '../types/api';

interface TrustRulesData {
  // Trust Score Thresholds
  trustedThreshold: number;        // 80+ → Full approval, no down payment
  verifiedThreshold: number;       // 60-79 → Partial approval, some down payment
  newCustomerThreshold: number;    // 40-59 → High down payment required
  restrictedThreshold: number;     // 20-39 → Emergency only
  // Below 20 → Auto-decline
  
  // Approval Policies
  autoApproveAbove: number;        // Auto-approve if trust score ≥ this
  autoDeclineBelow: number;        // Auto-decline if trust score < this
  requireManualReview: boolean;    // Require manual review for middle scores
  
  // Risk Management
  maxOutstandingPerCustomer: number;  // Max outstanding balance per customer
  allowEmergencyOverride: boolean;    // Allow emergency requests from restricted customers
  consecutiveFailureLimit: number;    // Max consecutive failures before restriction
  
  // Payment Behavior Rules
  penaltyForLatePay: number;         // Trust score penalty for late payment (-)
  bonusForOnTime: number;            // Trust score bonus for on-time payment (+)
  minimumHistoryForTrusted: number;  // Min successful payments to reach TRUSTED
}

interface TrustDistribution {
  trusted: number;
  verified: number;
  new: number;
  restricted: number;
  defaulted: number;
}

export default function TrustRules() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [distribution, setDistribution] = useState<TrustDistribution>({
    trusted: 0,
    verified: 0,
    new: 0,
    restricted: 0,
    defaulted: 0,
  });

  const [rules, setRules] = useState<TrustRulesData>({
    trustedThreshold: 80,
    verifiedThreshold: 60,
    newCustomerThreshold: 40,
    restrictedThreshold: 20,

    autoApproveAbove: 70,
    autoDeclineBelow: 30,
    requireManualReview: true,

    maxOutstandingPerCustomer: 200000,
    allowEmergencyOverride: true,
    consecutiveFailureLimit: 3,

    penaltyForLatePay: 10,
    bonusForOnTime: 5,
    minimumHistoryForTrusted: 5,
  });

  const loadRules = useCallback(async () => {
    if (!user?.email) return;

    try {
      const business = await businessApi.getByEmail(user.email);
      const apiRules = await trustRulesApi.getRules(business.id);

      // Map API data to UI model
      setRules({
        trustedThreshold: apiRules.trusted_min,
        verifiedThreshold: apiRules.verified_min,
        newCustomerThreshold: apiRules.new_min,
        restrictedThreshold: apiRules.restricted_min,
        autoApproveAbove: apiRules.auto_approve_threshold,
        autoDeclineBelow: apiRules.auto_decline_threshold,
        requireManualReview: true, // Not in API, keep default
        maxOutstandingPerCustomer: apiRules.max_outstanding_balance,
        allowEmergencyOverride: true, // Not in API, keep default
        consecutiveFailureLimit: apiRules.consecutive_failure_limit,
        penaltyForLatePay: apiRules.late_payment_penalty,
        bonusForOnTime: apiRules.on_time_bonus,
        minimumHistoryForTrusted: apiRules.min_history_for_trusted,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load trust rules';
      setError(errorMessage);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      loadRules();
      loadTrustDistribution();
    }
  }, [user?.email, loadRules]);

  const loadTrustDistribution = useCallback(async () => {
    if (!user?.email) return;

    // This would come from your backend analytics
    // For now, showing mock data
    setDistribution({
      trusted: 35,
      verified: 40,
      new: 15,
      restricted: 8,
      defaulted: 2,
    });
  }, [user?.email]);

  const handleSave = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const business = await businessApi.getByEmail(user.email);

      // Map UI model to API data
      const apiRules: ApiTrustRulesData = {
        business_id: business.id,
        trusted_min: rules.trustedThreshold,
        verified_min: rules.verifiedThreshold,
        new_min: rules.newCustomerThreshold,
        restricted_min: rules.restrictedThreshold,
        auto_approve_threshold: rules.autoApproveAbove,
        auto_decline_threshold: rules.autoDeclineBelow,
        max_outstanding_balance: rules.maxOutstandingPerCustomer,
        consecutive_failure_limit: rules.consecutiveFailureLimit,
        late_payment_penalty: rules.penaltyForLatePay,
        on_time_bonus: rules.bonusForOnTime,
        min_history_for_trusted: rules.minimumHistoryForTrusted,
      };

      await trustRulesApi.updateRules(business.id, apiRules);

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save trust rules';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRules({
      trustedThreshold: 80,
      verifiedThreshold: 60,
      newCustomerThreshold: 40,
      restrictedThreshold: 20,
      autoApproveAbove: 70,
      autoDeclineBelow: 30,
      requireManualReview: true,
      maxOutstandingPerCustomer: 200000,
      allowEmergencyOverride: true,
      consecutiveFailureLimit: 3,
      penaltyForLatePay: 10,
      bonusForOnTime: 5,
      minimumHistoryForTrusted: 5,
    });
  };

  const getTrustStateName = (score: number): { name: string; color: string; policy: string } => {
    if (score >= rules.trustedThreshold) {
      return {
        name: 'TRUSTED',
        color: 'text-green-600 bg-green-50',
        policy: 'Full approval, no down payment required',
      };
    } else if (score >= rules.verifiedThreshold) {
      return {
        name: 'VERIFIED',
        color: 'text-blue-600 bg-blue-50',
        policy: '80% approval, 20% down payment',
      };
    } else if (score >= rules.newCustomerThreshold) {
      return {
        name: 'NEW',
        color: 'text-yellow-600 bg-yellow-50',
        policy: '50% down payment required',
      };
    } else if (score >= rules.restrictedThreshold) {
      return {
        name: 'RESTRICTED',
        color: 'text-orange-600 bg-orange-50',
        policy: 'Emergency requests only',
      };
    } else {
      return {
        name: 'DEFAULTED',
        color: 'text-red-600 bg-red-50',
        policy: 'No instalments allowed',
      };
    }
  };

  return (
    <DashboardLayout
      title="Trust Decision Rules"
      breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Trust Rules' }]}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <p className="text-gray-600">
          Configure how TrustRail evaluates customer trustworthiness and makes approval decisions
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-900">{error}</p>
          </div>
        )}

        {/* Trust Score Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-500" />
            Your Customer Trust Distribution
          </h3>

          <div className="grid grid-cols-5 gap-4 mb-6">
            {Object.entries(distribution).map(([state, percentage]) => {
              const stateInfo = getTrustStateName(
                state === 'trusted' ? 85 :
                state === 'verified' ? 65 :
                state === 'new' ? 45 :
                state === 'restricted' ? 25 : 10
              );

              return (
                <div key={state} className="text-center">
                  <div className={`${stateInfo.color} rounded-lg p-4 mb-2`}>
                    <p className="text-3xl font-bold">{percentage}%</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{state}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {state === 'trusted' ? '80-100' :
                     state === 'verified' ? '60-79' :
                     state === 'new' ? '40-59' :
                     state === 'restricted' ? '20-39' : '0-19'}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 to-green-500 h-3 rounded-full mb-2"></div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>0 (High Risk)</span>
            <span>50 (Medium)</span>
            <span>100 (Low Risk)</span>
          </div>
        </div>

        {/* Trust State Thresholds */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Trust Score Thresholds
          </h3>

          <div className="space-y-6">
            {[
              { key: 'trustedThreshold', label: 'TRUSTED State', score: 80, desc: 'Customers with excellent payment history' },
              { key: 'verifiedThreshold', label: 'VERIFIED State', score: 60, desc: 'Customers with good payment history' },
              { key: 'newCustomerThreshold', label: 'NEW Customer', score: 40, desc: 'Customers with limited history' },
              { key: 'restrictedThreshold', label: 'RESTRICTED State', score: 20, desc: 'Customers with poor payment history' },
            ].map((threshold) => {
              const currentScore = rules[threshold.key as keyof TrustRulesData] as number;
              const stateInfo = getTrustStateName(currentScore);

              return (
                <div key={threshold.key}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {threshold.label}: {currentScore}+
                    </label>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stateInfo.color}`}>
                      {stateInfo.name}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentScore}
                    onChange={(e) =>
                      setRules({ ...rules, [threshold.key]: Number(e.target.value) })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">{threshold.desc}</p>
                  <p className="mt-1 text-xs text-blue-600 font-medium">{stateInfo.policy}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Approval Decision Rules */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-purple-500" />
            Automated Decision Rules
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Approve Trust Score: {rules.autoApproveAbove}+
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={rules.autoApproveAbove}
                onChange={(e) =>
                  setRules({ ...rules, autoApproveAbove: Number(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <p className="mt-1 text-sm text-gray-600">
                Customers with trust score ≥ {rules.autoApproveAbove} are automatically approved
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Decline Trust Score: Below {rules.autoDeclineBelow}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={rules.autoDeclineBelow}
                onChange={(e) =>
                  setRules({ ...rules, autoDeclineBelow: Number(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <p className="mt-1 text-sm text-gray-600">
                Customers with trust score &lt; {rules.autoDeclineBelow} are automatically declined
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="manualReview"
                  checked={rules.requireManualReview}
                  onChange={(e) =>
                    setRules({ ...rules, requireManualReview: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="manualReview" className="text-sm text-gray-700">
                  <span className="font-semibold">Require Manual Review for Middle Scores</span>
                  <p className="mt-1 text-gray-600">
                    Trust scores between {rules.autoDeclineBelow} and {rules.autoApproveAbove - 1} will be
                    flagged for your manual review before approval
                  </p>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
            Risk Management Policies
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Outstanding Balance Per Customer
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-700 font-medium">₦</span>
                <input
                  type="number"
                  value={rules.maxOutstandingPerCustomer}
                  onChange={(e) =>
                    setRules({ ...rules, maxOutstandingPerCustomer: Number(e.target.value) })
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Customers cannot have more than this amount in unpaid instalments
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consecutive Failure Limit: {rules.consecutiveFailureLimit} payments
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={rules.consecutiveFailureLimit}
                onChange={(e) =>
                  setRules({ ...rules, consecutiveFailureLimit: Number(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <p className="mt-1 text-sm text-gray-600">
                After {rules.consecutiveFailureLimit} consecutive failed payments, customer moves to RESTRICTED
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="emergencyOverride"
                  checked={rules.allowEmergencyOverride}
                  onChange={(e) =>
                    setRules({ ...rules, allowEmergencyOverride: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                />
                <label htmlFor="emergencyOverride" className="text-sm text-gray-700">
                  <span className="font-semibold">Allow Emergency Override</span>
                  <p className="mt-1 text-gray-600">
                    Customers in RESTRICTED state can still apply for emergency medical procedures
                  </p>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Behavior Scoring */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Behavior Scoring
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Late Payment Penalty: -{rules.penaltyForLatePay} points
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={rules.penaltyForLatePay}
                onChange={(e) =>
                  setRules({ ...rules, penaltyForLatePay: Number(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <p className="mt-1 text-sm text-gray-600">
                Trust score decreases by {rules.penaltyForLatePay} points for each late payment
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                On-Time Payment Bonus: +{rules.bonusForOnTime} points
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={rules.bonusForOnTime}
                onChange={(e) =>
                  setRules({ ...rules, bonusForOnTime: Number(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <p className="mt-1 text-sm text-gray-600">
                Trust score increases by {rules.bonusForOnTime} points for each on-time payment
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum History for TRUSTED: {rules.minimumHistoryForTrusted} payments
              </label>
              <input
                type="range"
                min="3"
                max="10"
                value={rules.minimumHistoryForTrusted}
                onChange={(e) =>
                  setRules({ ...rules, minimumHistoryForTrusted: Number(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="mt-1 text-sm text-gray-600">
                Customers need at least {rules.minimumHistoryForTrusted} successful payments to reach TRUSTED status
              </p>
            </div>
          </div>
        </div>

        {/* Example Scenarios */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Example Scenarios with Current Rules
          </h3>

          <div className="space-y-4">
            {[
              { score: 85, desc: 'New patient, excellent credit history' },
              { score: 65, desc: '3 successful payments, 1 late payment' },
              { score: 45, desc: 'First-time patient, no payment history' },
              { score: 25, desc: '2 consecutive failed payments' },
              { score: 15, desc: 'Multiple defaults, high risk' },
            ].map((scenario) => {
              const state = getTrustStateName(scenario.score);
              const decision =
                scenario.score >= rules.autoApproveAbove
                  ? '✅ AUTO-APPROVED'
                  : scenario.score < rules.autoDeclineBelow
                  ? '❌ AUTO-DECLINED'
                  : '⏸️ MANUAL REVIEW';

              return (
                <div
                  key={scenario.score}
                  className="bg-white rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-2xl font-bold text-gray-900">{scenario.score}</p>
                      <p className="text-xs text-gray-500">Trust Score</p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${state.color}`}>
                        {state.name}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">{scenario.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{decision}</p>
                    <p className="text-xs text-gray-600 mt-1">{state.policy}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleReset}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Reset to Defaults</span>
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Save className="h-5 w-5" />
            <span>{loading ? 'Saving...' : 'Save Trust Rules'}</span>
          </button>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Trust rules saved successfully!</span>
        </div>
      )}
    </DashboardLayout>
  );
}