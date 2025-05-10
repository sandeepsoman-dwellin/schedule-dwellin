
import { useNavigate } from "react-router-dom";
import AddressSearch from "./AddressSearch";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import AddressInput from "./AddressInput";
import { fetchServices } from "@/hooks/services/api";
import { AddressComponents } from "@/hooks/useGooglePlaces";

const Hero = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  
  // Expose the handleServiceBookNow method to parent components
  useImperativeHandle(ref, () => ({
    handleServiceBookNow
  }));
  
  // Check if we have a stored ZIP code when the component mounts
  useEffect(() => {
    const sessionZipCode = sessionStorage.getItem("zipCode");
    console.log("Hero - Initial session ZIP code:", sessionZipCode);
  }, []);
  
  const handleAddressSubmit = (zipCode: string, addressComponents?: AddressComponents) => {
    console.log("=== HERO ADDRESS SUBMIT ===");
    console.log("ZIP code submitted:", zipCode, "Components:", addressComponents);
    
    // Extract ZIP code from addressComponents if not provided directly
    const extractedZipCode = zipCode || (addressComponents?.postal_code || '');
    console.log("Extracted ZIP code:", extractedZipCode);
    
    // Store in session storage
    if (extractedZipCode) {
      sessionStorage.setItem("zipCode", extractedZipCode);
      localStorage.setItem("zipCode", extractedZipCode);
      console.log("Hero - Saved ZIP code to session/local storage:", extractedZipCode);
    }
    
    // Navigate to the services page with the ZIP code
    navigate(`/services?zip=${extractedZipCode}`);
  };

  const checkServiceAvailability = async (serviceId: string, zipCode: string) => {
    try {
      // Store ZIP code in session
      if (zipCode) {
        sessionStorage.setItem("zipCode", zipCode);
      }
      
      // Fetch services for the given zip code
      const services = await fetchServices(zipCode);
      
      // Check if the requested service is available for this zip code
      const serviceExists = services.some(service => service.id === serviceId);
      
      console.log(`Service ${serviceId} availability check for ZIP ${zipCode}:`, serviceExists);
      
      if (serviceExists) {
        // Service is available, navigate to service detail page
        navigate(`/services/${serviceId}?zip=${zipCode}`);
      } else {
        // Service is not available in this zip code
        toast.error("This service is not available in your area");
        navigate(`/unavailable?services=${serviceId}&zip=${zipCode}`);
      }
    } catch (error) {
      console.error("Error checking service availability:", error);
      toast.error("Failed to check service availability");
    }
  };

  const handleServiceBookNow = (serviceId: string) => {
    console.log("Book Now clicked for service:", serviceId);
    
    // Check if we have address in sessionStorage first (highest priority)
    const storedZipCode = sessionStorage.getItem("zipCode");
    const storedAddress = sessionStorage.getItem("customerAddress");
    const storedComponents = sessionStorage.getItem("addressComponents");
    
    // Fall back to localStorage if not in sessionStorage
    const localZipCode = localStorage.getItem("zipCode");
    const localAddress = localStorage.getItem("customerAddress");
    
    if (storedZipCode && storedAddress) {
      // We have address in sessionStorage, check service availability
      checkServiceAvailability(serviceId, storedZipCode);
    } else if (localZipCode && localAddress) {
      // We have address in localStorage, save to sessionStorage and check availability
      sessionStorage.setItem("zipCode", localZipCode);
      sessionStorage.setItem("customerAddress", localAddress);
      
      const localComponents = localStorage.getItem("addressComponents");
      if (localComponents) {
        sessionStorage.setItem("addressComponents", localComponents);
      }
      
      checkServiceAvailability(serviceId, localZipCode);
    } else {
      // No address found, show dialog to collect it
      setSelectedServiceId(serviceId);
      setShowAddressDialog(true);
    }
  };
  
  const handleAddressSelect = (address: string, zipCode: string, components?: AddressComponents) => {
    // Extract ZIP code from components if not provided directly
    const extractedZipCode = zipCode || (components?.postal_code || '');
    
    // Save to both sessionStorage and localStorage
    sessionStorage.setItem("customerAddress", address);
    sessionStorage.setItem("zipCode", extractedZipCode);
    localStorage.setItem("customerAddress", address);
    localStorage.setItem("zipCode", extractedZipCode);
    
    if (components) {
      const componentsString = JSON.stringify(components);
      sessionStorage.setItem("addressComponents", componentsString);
      localStorage.setItem("addressComponents", componentsString);
    }
    
    setShowAddressDialog(false);
    
    // Check service availability if a service was selected
    if (selectedServiceId) {
      checkServiceAvailability(selectedServiceId, extractedZipCode);
    }
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
            <AddressSearch onSubmit={handleAddressSubmit} autoNavigate={true} />
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
      
      {/* Address dialog for service booking */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Enter Your Address</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-gray-600 mb-6">
              Please enter your complete address with ZIP code to continue with booking
            </p>
            <AddressInput 
              onAddressSelect={handleAddressSelect} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

Hero.displayName = "Hero";

export default Hero;
