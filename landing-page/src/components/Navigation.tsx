import { useState, useEffect } from 'react';
import { Menu, X, Shield } from 'lucide-react';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = ['Features', 'How It Works', 'Pricing', 'About'];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-slate-200'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className={`text-xl md:text-2xl font-bold ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
              TrustRail
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className={`${isScrolled ? 'text-slate-700 hover:text-blue-600' : 'text-white/90 hover:text-white'} transition-colors duration-200 font-medium`}
              >
                {link}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              className={`px-4 py-2 ${isScrolled ? 'text-slate-700 hover:text-blue-600' : 'text-white/90 hover:text-white'} transition-colors duration-200 font-medium`}
              onClick={() => (window.location.href = 'http://localhost:5173/Login')}
            >
              Login
            </button>
            <button
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200"
              onClick={() => (window.location.href = 'http://localhost:5173/Register')}
            >
              Get Started Free
            </button>
          </div>

          <button
            className={`md:hidden p-2 ${isScrolled ? 'text-slate-900' : 'text-white'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="block text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link}
              </a>
            ))}
            <button
              className="w-full block px-4 py-2 text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium text-left"
              onClick={() => (window.location.href = 'http://localhost:5173/Login')}
            >
              Login
            </button>
            <button
              className="w-full block px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 text-center"
              onClick={() => (window.location.href = 'http://localhost:5173/Register')}
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
