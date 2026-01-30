import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SocialProof() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      quote:
        'TrustRail reduced our payment tracking time by 70%. We went from spreadsheet chaos to automated collections in one week.',
      name: 'Dr. Adeyemi Johnson',
      title: 'Operations Director, CareFlow Diagnostics',
      rating: 5,
    },
    {
      quote:
        'The trust scoring is incredible. We now approve payment plans instantly while maintaining a 92% collection rate. Game changer for our business.',
      name: 'Mrs. Sarah Okafor',
      title: 'CEO, BrightFuture Academy',
      rating: 5,
    },
    {
      quote:
        'No technical team needed. We were up and running in 30 minutes. Our customers love the flexibility, and we love the cash flow improvement.',
      name: 'Ibrahim Musa',
      title: 'Founder, TechHub Electronics',
      rating: 5,
    },
  ];

  const companies = [
    'CareFlow',
    'BrightFuture',
    'TechHub',
    'PayNest',
    'FlexiPay',
    'DataCore',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Trusted by Leading Nigerian Businesses
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          {companies.map((company, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-6 bg-white rounded-xl border-2 border-gray-200 grayscale hover:grayscale-0 transition-all duration-300 hover:border-blue-500"
            >
              <span className="text-xl font-bold text-gray-600">{company}</span>
            </div>
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 min-h-[300px] flex flex-col justify-between">
            <div className="mb-6">
              <div className="flex mb-4">
                {[...Array(testimonials[currentSlide].rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-6 h-6 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-6">
                "{testimonials[currentSlide].quote}"
              </p>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg">
                {testimonials[currentSlide].name}
              </div>
              <div className="text-gray-600">{testimonials[currentSlide].title}</div>
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
