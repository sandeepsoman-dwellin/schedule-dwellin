
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { toast } from "sonner";

// Define Google Maps types
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

interface AddressSearchProps {
  onSubmit: (zipCode: string) => void;
}

const AddressSearch = ({ onSubmit }: AddressSearchProps) => {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [placesLoaded, setPlacesLoaded] = useState(false);
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
      // Create the autocomplete object
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }, // Restrict to US addresses only
        fields: ['address_components', 'formatted_address'],
      });

      // Add listener for place changes
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        
        if (!place.address_components) {
          toast.error("Please select an address from the dropdown");
          return;
        }
        
        // Set the full address in the input
        setAddress(place.formatted_address);
        
        // Extract the zipcode (postal_code) from address components
        const zipCodeComponent = place.address_components.find(
          (component: any) => component.types.includes('postal_code')
        );
        
        if (zipCodeComponent) {
          // We found a zipcode, process the form
          handleFormSubmit(zipCodeComponent.long_name);
        } else {
          toast.error("Couldn't find a ZIP code for this address");
        }
      });
    } catch (error) {
      console.error("Error initializing Places Autocomplete:", error);
      toast.error("There was a problem with address search. Please try typing your address manually.");
    }
  }, [placesLoaded]);

  const handleFormSubmit = (zipCode: string) => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      onSubmit(zipCode);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error("Please enter an address");
      return;
    }

    setIsLoading(true);
    
    // Extract zipcode from address (fallback if autocomplete not used)
    const zipCodeRegex = /\b\d{5}\b/;
    const match = address.match(zipCodeRegex);
    const zipCode = match ? match[0] : "10001"; // Default to NYC if no zip found
    
    setTimeout(() => {
      setIsLoading(false);
      onSubmit(zipCode);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
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
