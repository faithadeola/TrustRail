export default function TrustScore() {
  const factors = [
    { name: 'BVN Verification', points: 20, progress: 100 },
    { name: 'Banking History', points: 30, progress: 100 },
    { name: 'Payment Track Record', points: 25, progress: 100 },
    { name: 'Account Activity', points: 15, progress: 100 },
    { name: 'Credit Behavior', points: 10, progress: 100 },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-700 via-blue-700 to-purple-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgydjJoLTJ2LTJ6bS0yIDJoLTJ2Mmgydi0yem0wLTJoMnYtMmgtMnYyem0wLTRoMnYtMmgtMnYyem0tMiAwaDJ2LTJoLTJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Trust Score Technology
          </h2>
          <p className="text-xl text-gray-200">
            Our proprietary algorithm evaluates customers instantly
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <div className="relative">
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeDasharray="85, 100"
                  strokeLinecap="round"
                  className="animate-draw"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#34D399" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl font-bold text-white">85</div>
                <div className="text-green-400 font-semibold text-lg">Excellent</div>
              </div>
              <div className="absolute inset-0 bg-green-500/20 blur-3xl"></div>
            </div>
          </div>

          <div className="space-y-6">
            {factors.map((factor, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{factor.name}</span>
                  </span>
                  <span className="text-green-400 font-bold text-sm">
                    +{factor.points}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full animate-progress"
                    style={{ width: `${factor.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}

            <div className="bg-green-500/20 border-2 border-green-400 rounded-xl p-4 mt-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-bold text-lg">
                    Result: Auto-Approved
                  </div>
                  <div className="text-green-300 text-sm">
                    Processed in 2.3 seconds
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes draw {
          from { stroke-dasharray: 0, 100; }
          to { stroke-dasharray: 85, 100; }
        }
        .animate-draw {
          animation: draw 2s ease-out forwards;
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 1.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
