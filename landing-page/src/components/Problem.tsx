import { FileSpreadsheet, AlertCircle, Code2, XIcon, Sparkles } from 'lucide-react';

export default function Problem() {
  const problems = [
    {
      icon: FileSpreadsheet,
      color: 'red',
      title: 'Manual Tracking Nightmare',
      description: 'Spreadsheet chaos',
      points: [
        '47 customers across 5 spreadsheets',
        '3 hours daily chasing payments',
        'No clear approval criteria',
      ],
    },
    {
      icon: AlertCircle,
      color: 'yellow',
      title: 'Revenue Delays',
      description: 'Lost revenue',
      points: [
        '₦4.2M in overdue payments',
        '30-40% default rates',
        'Constant cash flow issues',
      ],
    },
    {
      icon: Code2,
      color: 'gray',
      title: 'Integration Complexity',
      description: 'Technical barriers',
      points: [
        'Need developers for API integration',
        'Weeks of technical setup',
        'Expensive maintenance',
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      red: 'from-red-50 to-red-100 border-red-200',
      yellow: 'from-amber-50 to-amber-100 border-amber-200',
      gray: 'from-slate-50 to-slate-100 border-slate-200',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            The ₦40 Billion Problem
          </h2>
          <p className="text-xl text-slate-600">
            Nigerian businesses lose billions to payment inefficiencies
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${getColorClasses(
                  problem.color
                )} border-2 rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300`}
              >
                <div className="w-14 h-14 bg-white/50 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-slate-700" />
                </div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  {problem.description}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">
                  {problem.title}
                </h3>
                <ul className="space-y-3">
                  {problem.points.map((point, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <XIcon className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                      <span className="text-slate-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <Sparkles className="w-6 h-6" />
            <span className="text-lg font-semibold">
              TrustRail solves all of this in one platform
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
