import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import { useSettings } from '../../context/SettingsContext';
import { useEffect, useState } from 'react';
import { getNavigationPages } from '../../api/pageAPI';

const Footer = () => {
  const { settings } = useSettings();
  const [navigationPages, setNavigationPages] = useState([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchPages = async () => {
      const result = await getNavigationPages();
      if (result && result.data) {
        setNavigationPages(result.data);
      }
    };
    fetchPages();
  }, []);

  const siteName = settings?.siteName || 'ElectroMart';
  const siteDescription = settings?.siteDescription || 'Your one-stop destination for premium electronics and gadgets.';
  const contactInfo = settings?.contactEmail || settings?.contactPhone;
  const address = settings?.address;
  const socialMedia = settings?.socialMedia || {};
  const businessHours = settings?.businessHours;

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
                {siteName}
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              {siteDescription}
            </p>
            <div className="flex space-x-4">
              {socialMedia.facebook && (
                <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                  <FiFacebook className="w-6 h-6" />
                </a>
              )}
              {socialMedia.twitter && (
                <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                  <FiTwitter className="w-6 h-6" />
                </a>
              )}
              {socialMedia.instagram && (
                <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                  <FiInstagram className="w-6 h-6" />
                </a>
              )}
              {socialMedia.linkedin && (
                <a href={socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                  <FiLinkedin className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links - Dynamic from Database */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navigationPages.length > 0 ? (
                navigationPages.slice(0, 5).map((page) => (
                  <li key={page._id}>
                    <Link to={`/page/${page.slug}`} className="hover:text-primary-400 transition-colors capitalize">
                      {page.title}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/page/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
                  <li><Link to="/page/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
                  <li><Link to="/page/faq" className="hover:text-primary-400 transition-colors">FAQ</Link></li>
                  <li><Link to="/page/shipping" className="hover:text-primary-400 transition-colors">Shipping Info</Link></li>
                  <li><Link to="/page/returns" className="hover:text-primary-400 transition-colors">Returns & Refunds</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              {navigationPages.length > 0 ? (
                navigationPages.slice(5, 10).map((page) => (
                  <li key={page._id}>
                    <Link to={`/page/${page.slug}`} className="hover:text-primary-400 transition-colors capitalize">
                      {page.title}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/page/warranty" className="hover:text-primary-400 transition-colors">Warranty</Link></li>
                  <li><Link to="/page/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/page/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              {address && (
                <li>
                  <span className="text-gray-400 flex items-start gap-2">
                    <FiMapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>
                      {address.street && <p>{address.street}</p>}
                      {(address.city || address.state || address.zipCode) && (
                        <p>{[address.city, address.state, address.zipCode].filter(Boolean).join(', ')}</p>
                      )}
                      {address.country && <p>{address.country}</p>}
                    </span>
                  </span>
                </li>
              )}
              {settings?.contactPhone && (
                <li>
                  <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                    <FiPhone className="w-5 h-5" />
                    <span>{settings.contactPhone}</span>
                  </a>
                </li>
              )}
              {settings?.contactEmail && (
                <li>
                  <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                    <FiMail className="w-5 h-5" />
                    <span>{settings.contactEmail}</span>
                  </a>
                </li>
              )}
              {businessHours && (
                <li>
                  <span className="text-gray-400 flex items-start gap-2">
                    <FiClock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Business Hours:</p>
                      {Object.entries(businessHours).map(([day, hours]) => (
                        <p key={day} className="text-sm capitalize">
                          {day}: {hours.open} - {hours.close}
                        </p>
                      ))}
                    </div>
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} {siteName}. All rights reserved.
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
