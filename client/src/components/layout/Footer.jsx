import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-xl font-bold font-display text-white">
                Electro<span className="text-primary-400">Mart</span>
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Your one-stop destination for premium electronics and gadgets. Quality products, best prices, and excellent service.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-400 transition-colors"><FiFacebook className="w-6 h-6" /></a>
              <a href="#" className="hover:text-primary-400 transition-colors"><FiTwitter className="w-6 h-6" /></a>
              <a href="#" className="hover:text-primary-400 transition-colors"><FiInstagram className="w-6 h-6" /></a>
              <a href="#" className="hover:text-primary-400 transition-colors"><FiLinkedin className="w-6 h-6" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><Link to="/products" className="hover:text-primary-400 transition-colors">All Products</Link></li>
              <li><Link to="/products?featured=true" className="hover:text-primary-400 transition-colors">Featured</Link></li>
              <li><Link to="/products?sale=true" className="hover:text-primary-400 transition-colors">Sale</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link to="/faq" className="hover:text-primary-400 transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-primary-400 transition-colors">Shipping Info</Link></li>
              <li><Link to="/returns" className="hover:text-primary-400 transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/warranty" className="hover:text-primary-400 transition-colors">Warranty</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li>
                <span className="text-gray-400">📍 Address:</span>
                <p className="text-gray-300">123 Tech Street, Dhaka 1200, Bangladesh</p>
              </li>
              <li>
                <span className="text-gray-400">📞 Phone:</span>
                <p className="text-gray-300">+880-123-456-7890</p>
              </li>
              <li>
                <span className="text-gray-400">📧 Email:</span>
                <p className="text-gray-300">support@electromart.com</p>
              </li>
              <li>
                <span className="text-gray-400">⏰ Hours:</span>
                <p className="text-gray-300">Sat - Thu: 9:00 AM - 9:00 PM</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} ElectroMart. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <img src="https://via.placeholder.com/50x30?text=VISA" alt="VISA" className="h-6" />
              <img src="https://via.placeholder.com/50x30?text=MC" alt="Mastercard" className="h-6" />
              <img src="https://via.placeholder.com/50x30?text=bKash" alt="bKash" className="h-6" />
              <img src="https://via.placeholder.com/50x30?text=COD" alt="COD" className="h-6" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
