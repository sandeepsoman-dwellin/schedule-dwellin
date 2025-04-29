
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddressSearch from "./AddressSearch";
import { toast } from "sonner";

const Hero = () => {
  const navigate = useNavigate();
  
  const handleAddressSubmit = (zipCode: string) => {
    console.log("ZIP code submitted:", zipCode);
    
    if (!zipCode) {
      toast.error("Please provide a valid address with ZIP code");
      return;
    }
    
    // Check if zip code is valid (simple validation)
    if (!/^\d{5}$/.test(zipCode)) {
      toast.error("Please enter a valid 5-digit ZIP code");
      return;
    }
    
    // In a real implementation, you might want to check if the service is available in this ZIP code
    // For now, we'll just forward to the services page with the ZIP code
    navigate(`/services?zip=${zipCode}`);
  };

  return (
    <div className="relative bg-dwellin-white min-h-[85vh] flex flex-col justify-center">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute right-0 top-20 w-72 h-72 bg-dwellin-sky rounded-full blur-3xl"></div>
        <div className="absolute left-20 bottom-20 w-96 h-96 bg-dwellin-navy rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Fixed-fee home services,<br /> vetted pros, <span className="text-dwellin-sky">no hassles</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Book and pay online. We'll match you with pre-vetted professionals who 
            deliver quality work at transparent prices.
          </p>
          
          <div className="mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <AddressSearch onSubmit={handleAddressSubmit} />
            <p className="text-sm text-gray-500 mt-2">Enter your address to see available services</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 mt-16 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center">
              <div className="bg-dwellin-light-gray rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dwellin-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="ml-2 font-medium">Fixed prices</span>
            </div>
            
            <div className="flex items-center">
              <div className="bg-dwellin-light-gray rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dwellin-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="ml-2 font-medium">Vetted professionals</span>
            </div>
            
            <div className="flex items-center">
              <div className="bg-dwellin-light-gray rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dwellin-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="ml-2 font-medium">Satisfaction guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
