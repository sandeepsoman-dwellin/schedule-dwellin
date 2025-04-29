
import React, { useRef, useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { useGooglePlaces, GooglePlacesHookResult } from "@/hooks/useGooglePlaces";
import { toast } from "sonner";

interface AddressInputProps {
  onAddressSelect: (address: string, zipCode: string) => void;
}

const AddressInput = ({ onAddressSelect }: AddressInputProps) => {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  
  const { placesLoaded, setupAutocomplete, getZipCodeFromPlace } = useGooglePlaces();

  // Set up Places Autocomplete once the Places API is loaded
  useEffect(() => {
    if (!placesLoaded || !inputRef.current) return;
    
    // Setup the autocomplete
    autocompleteRef.current = setupAutocomplete(inputRef.current);
    
    if (autocompleteRef.current) {
      // Add listener for place changes
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        console.log("Place selected:", place);
        
        const extractedZipCode = getZipCodeFromPlace(place);
        
        if (extractedZipCode) {
          // Update state with full address and zipcode
          setAddress(place.formatted_address || "");
          setZipCode(extractedZipCode);
          
          // Process the address selection
          handleAddressSelection(place.formatted_address || "", extractedZipCode);
        } else {
          toast.error("Couldn't find a ZIP code for this address. Please try another address.");
        }
      });
    }
  }, [placesLoaded, setupAutocomplete, getZipCodeFromPlace]);

  // When the component mounts, focus the input field for better UX
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, []);

  const handleAddressSelection = (selectedAddress: string, selectedZipCode: string) => {
    setIsLoading(true);
    
    // Validate zip code
    if (!/^\d{5}$/.test(selectedZipCode)) {
      toast.error("Please enter a valid 5-digit ZIP code");
      setIsLoading(false);
      return;
    }

    // Submit the address and zip code
    setTimeout(() => {
      setIsLoading(false);
      onAddressSelect(selectedAddress, selectedZipCode);
    }, 500);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error("Please enter an address");
      return;
    }

    // If we already have a zip code from autocomplete, use it
    if (zipCode) {
      handleAddressSelection(address, zipCode);
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
    handleAddressSelection(address, extractedZipCode);
  };

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    // If the text changes, clear the stored zipCode to prevent using stale data
    if (zipCode && !e.target.value.includes(zipCode)) {
      setZipCode("");
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

export default AddressInput;
