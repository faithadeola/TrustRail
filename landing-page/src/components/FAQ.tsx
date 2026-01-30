import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does TrustRail work?',
      answer:
        'TrustRail is a no-code platform that lets you offer instalment payments to customers. You sign up, configure your payment rules, share your custom payment link, and our Trust logic system handles trust evaluation, approval, and automatic collections.',
    },
    {
      question: 'Do I need technical knowledge to use TrustRail?',
      answer:
        'No! TrustRail is designed for non-technical users. You can set up your entire payment system in just 2 minutes without writing a single line of code. Our interface is intuitive and easy to use.',
    },
    {
      question: 'How is the trust score calculated?',
      answer:
        'Our proprietary Trust logic evaluates multiple factors including BVN verification, banking history, payment track record, account activity, and credit behavior. The system provides a score from 0-100 and automatically approves or rejects customers based on your configured thresholds.',
    },
    {
      question: 'What payment methods do you support?',
      answer:
        'TrustRail is built on PayWithAccount infrastructure, supporting direct bank transfers from all major Nigerian banks. We handle the entire payment collection process automatically.',
    },
    {
      question: 'How much does it cost?',
      answer:
        'We offer a free Starter plan with up to 50 transactions per month. Our Business plan is ₦25,000/month with unlimited transactions. Enterprise plans are custom-priced based on your needs. All plans include PayWithAccount integration fees.',
    },
    {
      question: 'Is my customer data secure?',
      answer:
        'Absolutely. We use 256-bit encryption, maintain PCI compliance, and follow NDPR guidelines. Your customer data is stored securely and never shared with third parties without your permission.',
    },
    {
      question: 'Can I customize the payment portal?',
      answer:
        'Yes! Business and Enterprise plans include white-label capabilities. You can customize the payment portal with your logo, colors, and branding to provide a seamless experience for your customers.',
    },
    {
      question: 'What happens if a payment fails?',
      answer:
        'Our system automatically retries failed payments and sends notifications to customers. You can configure retry schedules and escalation procedures. Our support team is also available to help resolve any payment issues.',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about TrustRail
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-blue-500 transition-colors duration-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="text-lg font-semibold text-gray-900 pr-8">
                  {faq.question}
                </span>
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-white" />
                  ) : (
                    <Plus className="w-5 h-5 text-white" />
                  )}
                </div>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
