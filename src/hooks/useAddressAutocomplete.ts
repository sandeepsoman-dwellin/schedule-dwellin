
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
            console.warning("No geometry returned for this place");
            return;
          }
          
          // Extract address components
          const components = getAddressComponents(place);
          
          if (!components) {
            toast.error("Couldn't retrieve address details. Please try another address.");
            return;
          }
          
          const extractedZipCode = components?.postal_code || getZipCodeFromPlace(place);
          
          // Ensure we have all required components
          const hasStreetNumber = !!components.street_number;
          const hasStreetName = !!components.route;
          const hasCity = !!components.locality;
          const hasState = !!components.administrative_area_level_1;
          const hasZip = !!extractedZipCode;
          
          if (!hasStreetNumber || !hasStreetName || !hasCity || !hasState || !hasZip) {
            toast.warning("Address may be incomplete. Please verify all details are correct.");
          }
          
          if (extractedZipCode && components) {
            // Save address components
            setAddressComponents(components);
            
            // Format the address in the consistent format: house number, street, city, state, zip, country
            let formattedAddress = "";
            
            // Start with street number and name
            if (components.street_number && components.route) {
              formattedAddress = `${components.street_number} ${components.route}`;
            } else if (components.route) {
              formattedAddress = components.route;
            }
            
            // Add city
            if (components.locality) {
              formattedAddress += formattedAddress ? `, ${components.locality}` : components.locality;
            }
            
            // Add state
            if (components.administrative_area_level_1) {
              formattedAddress += formattedAddress ? `, ${components.administrative_area_level_1}` : components.administrative_area_level_1;
            }
            
            // Add zip code
            if (extractedZipCode) {
              formattedAddress += formattedAddress ? `, ${extractedZipCode}` : extractedZipCode;
            }
            
            // Add country (assuming US)
            formattedAddress += " USA";
            
            console.log("Formatted address:", formattedAddress);
            
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
