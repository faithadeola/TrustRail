import { UserPlus, Share2, CheckCircle2 } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: UserPlus,
      title: 'Sign Up & Configure',
      description:
        'Create your account, set your payment rules, and get your custom payment link in 2 minutes',
      image: 'Configuration dashboard',
      color: 'from-blue-500 to-blue-600',
    },
    {
      number: '02',
      icon: Share2,
      title: 'Share Your Link',
      description:
        'Share your custom link with customers via WhatsApp, email, or embed on your website',
      image: 'Payment link sharing',
      color: 'from-purple-500 to-purple-600',
    },
    {
      number: '03',
      icon: CheckCircle2,
      title: 'Automatic Collections',
      description:
        'Our Trust logic evaluates trust, approves customers, and collects payments automatically',
      image: 'Successful payment dashboard',
      color: 'from-emerald-500 to-emerald-600',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Get Started in 3 Simple Steps
          </h2>
          <p className="text-xl text-slate-600">
            No coding. No complexity. Just results.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-emerald-200 transform -translate-y-1/2"></div>

          <div className="grid md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="mb-6 relative inline-block">
                    <div className="text-8xl font-bold bg-gradient-to-br from-slate-200 to-slate-300 bg-clip-text text-transparent opacity-50 group-hover:opacity-60 transition-opacity duration-300">
                      {step.number}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-6">
                      {step.description}
                    </p>

                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                      <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                        <span className="text-sm text-slate-500 font-medium">
                          {step.image}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
