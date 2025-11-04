// src/components/BannerCarousel.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconChevronLeft, IconChevronRight } from './icons';

export default function BannerCarousel({ banners }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? banners.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === banners.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setTimeout(nextSlide, 5000); // Ganti slide setiap 5 detik
    return () => clearTimeout(timer);
  }, [currentIndex, banners.length]);

  if (!banners || banners.length === 0) {
    return (
      <div className="mb-8 h-48 w-full animate-pulse rounded-lg bg-gray-200 shadow-lg md:h-64"></div>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="group relative mb-8 h-48 w-full overflow-hidden rounded-lg bg-gray-200 shadow-lg md:h-64">
      <Link href={currentBanner.link || '/jelajah'} className="h-full w-full">
        <img
          src={currentBanner.gambar}
          alt={currentBanner.judul}
          className="h-full w-full object-cover transition-transform duration-500 ease-in-out"
          onError={(e) => (e.target.src = 'https://placehold.co/1200x400/e2e8f0/a1a1aa?text=Sadesa')}
        />
        {/* Overlay Judul (Opsional) */}
        {currentBanner.judul && (
          <div className="absolute bottom-0 left-0 w-full bg-black/30 p-4">
            <h3 className="font-bold text-white drop-shadow-lg md:text-xl">{currentBanner.judul}</h3>
          </div>
        )}
      </Link>

      {/* Tombol Navigasi */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/50 p-2 text-gray-800 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
          >
            <IconChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/50 p-2 text-gray-800 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
          >
            <IconChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Indikator Titik */}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-2">
        {banners.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              currentIndex === index ? 'bg-white' : 'bg-white/50'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}
