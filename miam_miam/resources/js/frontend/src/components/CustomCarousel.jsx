"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const carouselItems = [
  {
    image: "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=1200&h=800&fit=crop&crop=center",
    title: "Ndolé Traditionnel,",
    subtitle: "Spécialité Camerounaise",
  },
  {
    image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=1200&h=800&fit=crop&crop=center",
    title: "Poulet DG & Plantains,",
    subtitle: "Saveurs Authentiques",
  },
  {
    image: "https://media.istockphoto.com/id/1049262176/fr/photo/dessus-de-table-de-la-cuisine-avec-des-sauces-traditionnelles-et-alimentaire-en-afrique-avec.webp?a=1&b=1&s=612x612&w=0&k=20&c=FS7G9GwUt7jFWQ95TA7QLRWlhfSL8b5rEVFpml3rC98=",
    title: "Cuisine Camerounaise,",
    subtitle: "Tradition & Modernité",
  },
];

export default function CustomCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + carouselItems.length) % carouselItems.length
    );
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#cfbd97] rounded-lg overflow-hidden shadow-lg">
      <div className="absolute inset-0">
        {carouselItems.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          >
            <img
              src={item.image}
              alt={`Slide ${index + 1}`}
              className="object-cover w-full h-full transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
        <h2 className="text-4xl font-bold mb-2 drop-shadow-lg transition-all duration-500 transform">
          {carouselItems[currentSlide].title}
        </h2>
        <p className="text-xl mb-8 drop-shadow-lg transition-all duration-700 transform">
          {carouselItems[currentSlide].subtitle}
        </p>
        
        <div className="flex space-x-2">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                index === currentSlide ? "bg-white w-8 shadow-lg" : "bg-white/50 hover:bg-white/70"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
      
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/75 hover:text-white transition-colors bg-black/20 rounded-full p-2 hover:bg-black/40"
        aria-label="Diapositive précédente"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/75 hover:text-white transition-colors bg-black/20 rounded-full p-2 hover:bg-black/40"
        aria-label="Diapositive suivante"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}