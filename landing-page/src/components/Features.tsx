import { Brain, CreditCard, BarChart3, Palette, Smartphone, Bell, TrendingUp, Lock, MessageCircle } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Brain,
      title: 'Smart Trust Scoring',
      description:
        'AI-powered credit evaluation approves customers in seconds, not days',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: CreditCard,
      title: 'Seamless Integration',
      description:
        'Built on PayWithAccount infrastructure for reliable, secure payments',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Dashboard',
      description:
        'Track all payments, customers, and performance in one beautiful interface',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Palette,
      title: 'White-Label Portal',
      description:
        'Fully branded payment experience with your logo and colors',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description:
        'Perfect experience on any device - desktop, tablet, or mobile',
      color: 'from-cyan-500 to-cyan-600',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description:
        'Email and SMS alerts for you and your customers at every step',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description:
        'Understand payment patterns, success rates, and customer behavior',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: Lock,
      title: 'Bank-Level Security',
      description:
        '256-bit encryption, PCI compliance, and fraud protection built-in',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: MessageCircle,
      title: 'Priority Support',
      description:
        'Nigerian support team available via WhatsApp, email, and phone',
      color: 'from-teal-500 to-teal-600',
    },
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Everything You Need to Scale
          </h2>
          <p className="text-xl text-slate-600">
            Powerful features that actually work for Nigerian businesses
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white border border-slate-200 rounded-2xl p-8 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
