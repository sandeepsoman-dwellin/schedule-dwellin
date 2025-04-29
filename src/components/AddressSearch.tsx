
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Define Google Maps types
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

interface AddressSearchProps {
  onSubmit: (zipCode: string) => void;
  autoNavigate?: boolean;
}

const AddressSearch = ({ onSubmit, autoNavigate = false }: AddressSearchProps) => {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [placesLoaded, setPlacesLoaded] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Initialize Google Maps Places API
  useEffect(() => {
    // Skip if already loaded or if we're in a server environment
    if (typeof window === "undefined" || window.google?.maps?.places || document.getElementById('google-maps-script')) {
      setPlacesLoaded(!!window.google?.maps?.places);
      return;
    }

    // Create a function that Google Maps will call when loaded
    window.initGoogleMaps = () => {
      setPlacesLoaded(true);
      console.log("Google Maps Places API loaded successfully");
    };

    // Create the script tag
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC0PUwthcVcCMlhVPbpoCRtEeW0HQgWmbQ&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Append the script to the DOM
    document.head.appendChild(script);

    // Cleanup function to remove the script if the component unmounts
    return () => {
      if (document.getElementById('google-maps-script')) {
        document.getElementById('google-maps-script')?.remove();
        delete window.initGoogleMaps;
      }
    };
  }, []);

  // Set up Places Autocomplete once the Places API is loaded
  useEffect(() => {
    if (!placesLoaded || !inputRef.current) return;
    
    try {
      console.log("Setting up Places Autocomplete");
      // Create the autocomplete object
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }, // Restrict to US addresses only
        fields: ['address_components', 'formatted_address'],
      });

      // Add listener for place changes
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        console.log("Place selected:", place);
        
        if (!place || !place.address_components) {
          toast.error("Please select a valid address from the dropdown");
          return;
        }
        
        // Set the full address in the input
        setAddress(place.formatted_address || "");
        
        // Extract the zipcode (postal_code) from address components
        const zipCodeComponent = place.address_components.find(
          (component: any) => component.types.includes('postal_code')
        );
        
        if (zipCodeComponent) {
          // We found a zipcode, process it
          const extractedZipCode = zipCodeComponent.long_name;
          console.log("ZIP code extracted:", extractedZipCode);
          setZipCode(extractedZipCode);
          processZipCode(extractedZipCode);
        } else {
          toast.error("Couldn't find a ZIP code for this address. Please try another address.");
        }
      });
    } catch (error) {
      console.error("Error initializing Places Autocomplete:", error);
      toast.error("There was a problem with address search. Please try typing your address manually.");
    }
  }, [placesLoaded]);

  // Process the zipcode and either submit it or navigate directly
  const processZipCode = (zipToProcess: string) => {
    setIsLoading(true);
    
    // Validate zip code
    if (!/^\d{5}$/.test(zipToProcess)) {
      toast.error("Please enter a valid 5-digit ZIP code");
      setIsLoading(false);
      return;
    }

    if (autoNavigate) {
      // Directly navigate to services page with the zip code
      setTimeout(() => {
        setIsLoading(false);
        navigate(`/services?zip=${zipToProcess}`);
      }, 500);
    } else {
      // Use the provided onSubmit handler
      setTimeout(() => {
        setIsLoading(false);
        onSubmit(zipToProcess);
      }, 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error("Please enter an address");
      return;
    }

    // If we already have a zip code from autocomplete, use it
    if (zipCode) {
      processZipCode(zipCode);
      return;
    }

    // Extract zipcode from address (fallback if autocomplete not used)
    const zipCodeRegex = /\b\d{5}\b/;
    const match = address.match(zipCodeRegex);
    
    if (!match) {
      toast.error("Please enter an address with a valid ZIP code or select from the dropdown");
      return;
    }
    
    const extractedZipCode = match[0];
    console.log("ZIP code extracted from manual entry:", extractedZipCode);
    setZipCode(extractedZipCode);
    processZipCode(extractedZipCode);
  };

  // When the component mounts, focus the input field for better UX
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            // If the text changes, clear the stored zipCode to prevent using stale data
            if (zipCode && !e.target.value.includes(zipCode)) {
              setZipCode("");
            }
          }}
          placeholder="Enter your address"
          className="pl-10 py-6 text-base"
          required
          ref={inputRef}
          disabled={!placesLoaded}
        />
        {!placesLoaded && (
          <div className="absolute inset-y-0 right-12 flex items-center">
            <div className="h-4 w-4 border-t-2 border-b-2 border-dwellin-sky rounded-full animate-spin" />
          </div>
        )}
        <Button 
          type="submit" 
          className="absolute right-1 top-1 bottom-1 px-4 bg-dwellin-sky hover:bg-opacity-90 text-white"
          disabled={isLoading || !placesLoaded}
        >
          {isLoading ? (
            <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </Button>
      </div>
      {!placesLoaded && <p className="text-sm text-gray-500 mt-2">Loading address search...</p>}
    </form>
  );
};

export default AddressSearch;
