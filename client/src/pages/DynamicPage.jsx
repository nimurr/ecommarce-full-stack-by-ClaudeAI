import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiChevronRight, FiMail, FiPhone, FiMapPin, FiHelpCircle } from 'react-icons/fi';
import { getPageBySlug } from '../api/pageAPI';
import { Helmet } from 'react-helmet-async';

const DynamicPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getPageBySlug(slug);
        setPage(result.data);
      } catch (err) {
        setError(err.message || 'Page not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="container-custom py-16">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  // Render FAQs if page type is FAQ
  const renderFAQs = () => {
    if (page.type !== 'faq' || !page.faqs || page.faqs.length === 0) return null;

    return (
      <div className="space-y-4 mt-8">
        {page.faqs.sort((a, b) => a.order - b.order).map((faq, index) => (
          <div key={index} className="card">
            <div className="flex items-start gap-3">
              <FiHelpCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render contact info if page type is contact
  const renderContactInfo = () => {
    if (page.type !== 'contact' || !page.contactInfo) return null;

    const { email, phone, address } = page.contactInfo;

    return (
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {email && (
          <div className="card text-center">
            <FiMail className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Email</h3>
            <a href={`mailto:${email}`} className="text-primary-600 hover:underline">{email}</a>
          </div>
        )}
        {phone && (
          <div className="card text-center">
            <FiPhone className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Phone</h3>
            <a href={`tel:${phone}`} className="text-primary-600 hover:underline">{phone}</a>
          </div>
        )}
        {address && (address.street || address.city) && (
          <div className="card text-center">
            <FiMapPin className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Address</h3>
            <address className="text-gray-600 not-italic">
              {address.street && <p>{address.street}</p>}
              {(address.city || address.state || address.zipCode) && (
                <p>{[address.city, address.state, address.zipCode].filter(Boolean).join(', ')}</p>
              )}
              {address.country && <p>{address.country}</p>}
            </address>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <FiChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{page.title}</span>
      </nav>

      {/* SEO */}
      <Helmet>
        <title>{page.metaTitle || page.title} | ElectroMart</title>
        <meta name="description" content={page.metaDescription || page.excerpt || page.content?.substring(0, 160)} />
        {page.metaKeywords?.length > 0 && (
          <meta name="keywords" content={page.metaKeywords.join(', ')} />
        )}
      </Helmet>

      {/* Page Content */}
      <div className="card p-8">
        <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
        
        {page.excerpt && (
          <p className="text-lg text-gray-600 mb-6 pb-6 border-b">{page.excerpt}</p>
        )}

        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content?.replace(/\n/g, '<br/>') }}
        />

        {renderContactInfo()}
        {renderFAQs()}
      </div>
    </div>
  );
};

export default DynamicPage;
