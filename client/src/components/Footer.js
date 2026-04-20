import { Link } from "react-router-dom";
import { Car, Mail, Phone, MapPin, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Brand Section */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400 group w-fit">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Car size={24} />
              </div>
              <span>RentaRide</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Making vehicle rentals easy, affordable, and accessible for everyone.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Contact Us</h3>
            <div className="flex flex-col gap-3">
              <a href="mailto:support@rentaride.com" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors group">
                <Mail size={16} className="group-hover:scale-110 transition-transform" />
                support@rentaride.com
              </a>
              <a href="tel:+977 9864426073" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors group">
                <Phone size={16} className="group-hover:scale-110 transition-transform" />
                +977 9864426073
              </a>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm font-medium">
                <MapPin size={16} />
                Available 24/7
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800"></div>

        {/* Bottom Section */}
        <div className="py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
            <span>© 2026 RentaRide. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="#privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors">
              Privacy
            </a>
            <a href="#terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors">
              Terms
            </a>
            <a href="#cookies" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors">
              Cookies
            </a>
          </div>

          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
            <span>Made by Mandip Das</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
