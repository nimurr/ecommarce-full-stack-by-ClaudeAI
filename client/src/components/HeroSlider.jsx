import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import axios from 'axios';
import imageUrl from '../utils/baseUrl';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const HeroSlider = () => {
  const [sliders, setSliders] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const response = await axios.get(`${API_URL}/sliders?isActive=true`);
      setSliders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch sliders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto slide every 5 seconds
  useEffect(() => {
    if (sliders.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [sliders.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % sliders.length);
  };

  if (loading) {
    return (
      <section className="relative h-[500px] md:h-[600px] bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </section>
    );
  }

  if (sliders.length === 0) {
    // Fallback to static hero if no sliders
    return (
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container-custom py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight">
                Discover the Latest in <span className="text-yellow-300">Electronics</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-100">
                Shop premium gadgets at unbeatable prices. From smartphones to laptops, we have it all.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                  Shop Now <FiArrowRight className="inline ml-2" />
                </Link>
                <Link to="/products?sale=true" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600">
                  View Deals
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&h=400&fit=crop"
                alt="Electronics"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentSlider = sliders[currentSlide];

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Slide Image Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url( ${imageUrl}${currentSlider.image})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container-custom h-full flex items-center">
        <div className="max-w-2xl text-white space-y-6 animate-fade-in">
          {currentSlider.subtitle && (
            <p className="text-lg md:text-xl text-primary-200 font-medium">
              {currentSlider.subtitle}
            </p>
          )}
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight">
            {currentSlider.title}
          </h1>

          {currentSlider.description && (
            <p className="text-lg text-gray-200">
              {currentSlider.description}
            </p>
          )}

          {currentSlider.buttonText && (
            <div className="pt-4">
              {currentSlider.linkType === 'url' ? (
                <a
                  href={currentSlider.buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary bg-white text-primary-600 hover:bg-gray-100 inline-flex items-center gap-2"
                >
                  {currentSlider.buttonText} <FiArrowRight className="w-5 h-5" />
                </a>
              ) : (
                <Link
                  to={currentSlider.buttonLink}
                  className="btn-primary bg-white text-primary-600 hover:bg-gray-100 inline-flex items-center gap-2"
                >
                  {currentSlider.buttonText} <FiArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
            aria-label="Previous slide"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
            aria-label="Next slide"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {sliders.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
          {sliders.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSlider;
