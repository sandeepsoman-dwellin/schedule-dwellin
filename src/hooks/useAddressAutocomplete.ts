
import { useRef, useEffect } from "react";
import { useGooglePlaces, AddressComponents } from "@/hooks/useGooglePlaces";
import { toast } from "sonner";

interface UseAddressAutocompleteProps {
  inputRef: React.RefObject<HTMLInputElement>;
  setAddress: (address: string) => void;
  setZipCode: (zipCode: string) => void;
  setAddressComponents: (components: AddressComponents | null) => void;
  handleAddressSelection: (address: string, zipCode: string, components?: AddressComponents) => void;
}

export function useAddressAutocomplete({
  inputRef,
  setAddress,
  setZipCode,
  setAddressComponents,
  handleAddressSelection
}: UseAddressAutocompleteProps) {
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
  }, [placesLoaded, quotaExceeded, inputRef, setAddress, setZipCode, setAddressComponents, handleAddressSelection, getAddressComponents, getZipCodeFromPlace, setupAutocomplete]);

  // When the component mounts, focus the input field for better UX
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, [inputRef]);

  return {
    placesLoaded,
    quotaExceeded
  };
}
