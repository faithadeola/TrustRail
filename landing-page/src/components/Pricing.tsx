import { Check } from 'lucide-react';

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '0',
      period: '/month',
      description: 'Perfect for trying out TrustRail',
      features: [
        'Up to 50 transactions/month',
        'Basic trust scoring',
        'Email support',
        'Payment link',
        'Dashboard access',
        'Mobile app',
      ],
      cta: 'Start Free',
      popular: false,
      outline: true,
    },
    {
      name: 'Business',
      price: '25,000',
      period: '/month',
      description: 'For growing businesses',
      features: [
        'Unlimited transactions',
        'Advanced trust scoring',
        'Priority support (24/7)',
        'Custom branding',
        'Analytics & reports',
        'API access',
        'Webhook integration',
        'Dedicated account manager',
      ],
      cta: 'Start 14-Day Trial',
      popular: true,
      outline: false,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: [
        'Everything in Business',
        'Custom integrations',
        'SLA guarantees',
        'On-premise deployment',
        'White-label solution',
        'Training & onboarding',
        'Custom contracts',
      ],
      cta: 'Contact Sales',
      popular: false,
      outline: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">Start free, scale as you grow</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 ${
                plan.popular
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl scale-105 border-4 border-blue-400'
                  : 'bg-gray-50 border-2 border-gray-200'
              } hover:shadow-2xl hover:-translate-y-2 transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    plan.popular ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm ${
                    plan.popular ? 'text-gray-200' : 'text-gray-600'
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  {plan.price === 'Custom' ? (
                    <span
                      className={`text-4xl font-bold ${
                        plan.popular ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {plan.price}
                    </span>
                  ) : (
                    <>
                      <span
                        className={`text-xl ${
                          plan.popular ? 'text-gray-200' : 'text-gray-600'
                        }`}
                      >
                        ₦
                      </span>
                      <span
                        className={`text-5xl font-bold ${
                          plan.popular ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={`text-lg ml-1 ${
                          plan.popular ? 'text-gray-200' : 'text-gray-600'
                        }`}
                      >
                        {plan.period}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <button
                className={`w-full py-4 rounded-xl font-semibold mb-8 transition-all duration-200 ${
                  plan.popular
                    ? 'bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl hover:scale-105'
                    : plan.outline
                    ? 'border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.cta}
              </button>

              <ul className="space-y-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <Check
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.popular ? 'text-green-300' : 'text-green-500'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        plan.popular ? 'text-gray-100' : 'text-gray-700'
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm">
          All plans include PayWithAccount integration fees
        </p>
      </div>
    </section>
  );
}
