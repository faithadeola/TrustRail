import { Shield, Lock, Activity, CheckCircle } from 'lucide-react';

export default function FinalCTA() {
  const badges = [
    { icon: Lock, label: '256-bit SSL Encryption' },
    { icon: Shield, label: 'PCI Compliant' },
    { icon: CheckCircle, label: 'NDPR Compliant' },
    { icon: Activity, label: '99.9% Uptime' },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2Mi1oMnYtMmgtMnptMCA0aDJ2MmgtMnYtMnptLTIgMmgtMnYyaDJ2LTJ6bTAtMmgydi0yaC0ydjJ6bTAtNGgydi0yaC0ydjJ6bS0yIDBoMnYtMmgtMnYyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Transform Your Payment Operations?
          </h2>
          <p className="text-xl text-gray-100 mb-8">
            Join 500+ businesses already using TrustRail
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200">
              Start Free Trial
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-200">
              Schedule a Demo
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {badges.map((badge, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300"
              >
                <badge.icon className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-white text-sm font-medium">{badge.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
