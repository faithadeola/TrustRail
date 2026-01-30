import { Play, ChevronDown, TrendingUp, Shield, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgydjJoLTJ2LTJ6bS0yIDJoLTJ2Mmgydi0yem0wLTJoMnYtMmgtMnYyem0wLTRoMnYtMmgtMnYyem0tMiAwaDJ2LTJoLTJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 backdrop-blur-md px-4 py-2 rounded-full border border-blue-500/20">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-blue-100 text-sm font-medium">
                Trusted by 500+ Nigerian Businesses
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Turn Payment Delays Into
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mt-2">
                Instalment Plans That Work
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              The no-code trust orchestration platform that helps Nigerian
              businesses offer instalment payments without technical complexity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2" onClick={() => window.location.href='/Register'}>
                <Sparkles className="w-5 h-5" />
                <span>Start Free Trial</span>
              </button>
              <button className="px-8 py-4 border-2 border-slate-600 bg-slate-800/50 text-white rounded-xl font-semibold hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-300 flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-slate-300">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>2-minute setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Free forever plan</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative z-10 space-y-4 animate-float">
              <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-300 text-sm font-medium">Payment Success</span>
                  <span className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-medium">Paid</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">₦450,000</div>
                <div className="text-slate-400 text-sm">Customer: Adewale Industries</div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-transform duration-300 ml-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-300 text-sm font-medium">Trust Score</span>
                  <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">Approved</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20">
                    <svg className="transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.2)"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeDasharray="85, 100"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">85</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-lg">Excellent</div>
                    <div className="text-slate-400 text-sm">Auto-approved</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium">New Payment Received</div>
                    <div className="text-slate-400 text-sm">2 minutes ago</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 blur-3xl"></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-slate-400" />
      </div>
    </section>
  );
}
