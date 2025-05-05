
import React, { useRef, useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, AlertCircle } from "lucide-react";
import { useGooglePlaces, AddressComponents } from "@/hooks/useGooglePlaces";
import { toast } from "sonner";

interface AddressInputProps {
  onAddressSelect: (address: string, zipCode: string, addressComponents?: AddressComponents) => void;
}

const AddressInput = ({ onAddressSelect }: AddressInputProps) => {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const [addressComponents, setAddressComponents] = useState<AddressComponents | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  
  const { placesLoaded, setupAutocomplete, getAddressComponents, getZipCodeFromPlace, quotaExceeded } = useGooglePlaces();

  // Set up Places Autocomplete once the Places API is loaded
  useEffect(() => {
    if (!placesLoaded || !inputRef.current || quotaExceeded) return;
    
    try {
      // Setup the autocomplete
      autocompleteRef.current = setupAutocomplete(inputRef.current);
      
      if (autocompleteRef.current) {
        // Add listener for place changes
        window.google.maps.event.addListener(autocompleteRef.current, 'place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          console.log("Place selected:", place);
          
          if (!place.geometry) {
            console.warn("No geometry returned for this place");
            return;
          }
          
          // Extract address components
          const components = getAddressComponents(place);
          const extractedZipCode = components?.postal_code || getZipCodeFromPlace(place);
          
          if (extractedZipCode && components) {
            // Save address components
            setAddressComponents(components);
            
            // Update the address field to the formatted address
            let formattedAddress = components.formatted_address || place.formatted_address || "";
            
            // Ensure ZIP code is included in the address display
            if (!formattedAddress.includes(extractedZipCode)) {
              formattedAddress += ` ${extractedZipCode}`;
            }
            
            console.log("Formatted address with ZIP:", formattedAddress);
            
            // Set both the complete address and extracted zipcode
            setAddress(formattedAddress);
            setZipCode(extractedZipCode);
            
            // Process the address selection
            handleAddressSelection(formattedAddress, extractedZipCode, components);
          } else {
            toast.error("Couldn't find a ZIP code for this address. Please try another address.");
          }
        });
      }
    } catch (error) {
      console.error("Error setting up autocomplete:", error);
    }
    
    return () => {
      // Clean up listeners when component unmounts
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [placesLoaded, quotaExceeded]);

  // Load address from sessionStorage if available
  useEffect(() => {
    const storedAddress = sessionStorage.getItem("customerAddress");
    const storedZipCode = sessionStorage.getItem("zipCode");
    const storedComponents = sessionStorage.getItem("addressComponents");
    
    if (storedAddress && storedZipCode) {
      setAddress(storedAddress);
      setZipCode(storedZipCode);
      
      if (storedComponents) {
        try {
          setAddressComponents(JSON.parse(storedComponents));
        } catch (e) {
          console.error("Error parsing stored address components:", e);
        }
      }
    }
  }, []);

  // When the component mounts, focus the input field for better UX
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, []);

  const handleAddressSelection = (
    selectedAddress: string, 
    selectedZipCode: string, 
    components?: AddressComponents
  ) => {
    setIsLoading(true);
    
    // Validate zip code
    if (!/^\d{5}$/.test(selectedZipCode)) {
      toast.error("Please enter a valid 5-digit ZIP code");
      setIsLoading(false);
      return;
    }

    // Ensure all required components are present
    if (components) {
      const hasStreet = !!(components.street_number && components.route);
      const hasCity = !!components.locality;
      const hasState = !!components.administrative_area_level_1;
      
      if (!hasStreet || !hasCity || !hasState) {
        toast.warn("Address may be incomplete. Please check that it contains street, city, and state.");
      }
      
      // Save address components to sessionStorage
      sessionStorage.setItem("addressComponents", JSON.stringify(components));
      localStorage.setItem("addressComponents", JSON.stringify(components));
    }

    // Ensure ZIP code is included in the displayed address
    if (!selectedAddress.includes(selectedZipCode)) {
      selectedAddress += ` ${selectedZipCode}`;
    }

    // Save address to sessionStorage
    sessionStorage.setItem("customerAddress", selectedAddress);
    sessionStorage.setItem("zipCode", selectedZipCode);
    localStorage.setItem("customerAddress", selectedAddress);
    localStorage.setItem("zipCode", selectedZipCode);

    // Submit the address and zip code
    setTimeout(() => {
      setIsLoading(false);
      onAddressSelect(selectedAddress, selectedZipCode, components);
    }, 500);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error("Please enter an address");
      return;
    }

    // If we already have a zip code from autocomplete, use it
    if (zipCode && addressComponents) {
      handleAddressSelection(address, zipCode, addressComponents);
      return;
    }

    // Extract zipcode from address (fallback if autocomplete not used)
    const zipCodeRegex = /\b\d{5}\b/;
    const match = address.match(zipCodeRegex);
    
    if (!match) {
      toast.error("Please enter an address with a valid ZIP code");
      return;
    }
    
    const extractedZipCode = match[0];
    console.log("ZIP code extracted from manual entry:", extractedZipCode);
    setZipCode(extractedZipCode);
    
    // Create a simple address components object for manual entry
    const manualComponents: AddressComponents = {
      postal_code: extractedZipCode,
      formatted_address: address
    };
    
    handleAddressSelection(address, extractedZipCode, manualComponents);
  };

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    // If the text changes, clear the stored zipCode to prevent using stale data
    if (zipCode && !e.target.value.includes(zipCode)) {
      setZipCode("");
      setAddressComponents(null);
    }
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
          onChange={handleAddressChange}
          placeholder={quotaExceeded ? "Enter full address with ZIP code (e.g. 123 Main St, City, 12345)" : "Enter your address"}
          className="pl-10 py-6 text-base"
          required
          ref={inputRef}
        />
        {!placesLoaded && !quotaExceeded && (
          <div className="absolute inset-y-0 right-12 flex items-center">
            <div className="h-4 w-4 border-t-2 border-b-2 border-dwellin-sky rounded-full animate-spin" />
          </div>
        )}
        <Button 
          type="submit" 
          className="absolute right-1 top-1 bottom-1 px-4 bg-dwellin-sky hover:bg-opacity-90 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </Button>
      </div>
      {quotaExceeded && (
        <div className="mt-2 flex items-center text-amber-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          <p className="text-sm">Address autocomplete is limited. Please type your full address including ZIP code.</p>
        </div>
      )}
      {!placesLoaded && !quotaExceeded && (
        <p className="text-sm text-gray-500 mt-2">Loading address search...</p>
      )}
    </form>
  );
};

export default AddressInput;
