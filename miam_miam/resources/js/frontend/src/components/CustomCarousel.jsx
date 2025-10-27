"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const carouselItems = [
  {
    image: "https://scontent-los2-1.xx.fbcdn.net/v/t1.6435-9/93933277_2459780187667742_5303570301664100352_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Q7nr0ZgjKysQ7kNvwE1TF8F&_nc_oc=AdmIP1xNsmbbHlNmgtWUBOpJIQ2Ir37ga6m19IERe7wF9V7IT1wpz-Kn5v3PdsregFE&_nc_zt=23&_nc_ht=scontent-los2-1.xx&_nc_gid=DgpqlUmM-zmXQ3EoXu7gCw&oh=00_AfcxtT8sFOYrXAWdvkfv4zll2R09gEGMUM9CwLQmNBUGew&oe=6926802E",
    title: "Ndolé Traditionnel,",
    subtitle: "Spécialité Camerounaise",
  },
  {
    image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=1200&h=800&fit=crop&crop=center",
    title: "Poulet DG & Plantains,",
    subtitle: "Saveurs Authentiques",
  },
  {
    image: "https://s3-eu-west-1.amazonaws.com/images-ca-1-0-1-eu/tag_photos/original/27508/cuisine-camerounaise-flickr-8164269377_1036295a4a_k.jpg",
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