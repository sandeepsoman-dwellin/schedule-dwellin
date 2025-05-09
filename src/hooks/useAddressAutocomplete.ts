
import { useRef, useEffect, useState } from "react";
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
  // Create a div container for the autocomplete element
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { placesLoaded, setupPlaceAutocomplete, getAddressComponents, getZipCodeFromPlace, quotaExceeded } = useGooglePlaces();
  const [autocompleteInitialized, setAutocompleteInitialized] = useState(false);
  
  // Create a container element for the autocomplete
  useEffect(() => {
    if (!containerRef.current) {
      const container = document.createElement('div');
      container.id = 'place-autocomplete-container';
      container.style.position = 'absolute';
      container.style.width = '100%';
      container.style.zIndex = '50';
      
      containerRef.current = container;
      
      return () => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      };
    }
  }, []);
  
  // Set up Places Autocomplete once the Places API is loaded
  useEffect(() => {
    if (!placesLoaded || !containerRef.current || quotaExceeded || autocompleteInitialized) return;
    
    try {
      // Setup the Place Autocomplete
      setupPlaceAutocomplete(containerRef.current, inputRef);
      setAutocompleteInitialized(true);
      
      // Listen for the place_changed event on the container
      const placeChangedListener = (event: any) => {
        if (!event.detail || !event.detail.place) {
          console.warn("No place returned from event");
          return;
        }
        
        const place = event.detail.place;
        console.log("Place selected:", place);
        
        // Extract address components
        const components = getAddressComponents(place);
        
        if (!components) {
          toast.error("Couldn't retrieve address details. Please try another address.");
          return;
        }
        
        // Get ZIP code from components or try to extract it
        let extractedZipCode = '';
        
        // First check if postal_code exists in components
        if (components.postal_code) {
          extractedZipCode = components.postal_code;
          console.log("ZIP code found in components:", extractedZipCode);
        } else {
          // Try using the helper function
          extractedZipCode = getZipCodeFromPlace(place) || '';
          console.log("ZIP code from getZipCodeFromPlace:", extractedZipCode);
          
          // If still no zip code, try to extract from formatted address
          if (!extractedZipCode && place.formatted_address) {
            const zipCodeRegex = /\b\d{5}(?:-\d{4})?\b/g;
            const matches = Array.from(place.formatted_address.matchAll(zipCodeRegex));
            
            if (matches && matches.length > 0) {
              // Get the last match which is more likely to be the ZIP code
              extractedZipCode = matches[matches.length - 1][0].substring(0, 5);
              console.log("ZIP code extracted from formatted address:", extractedZipCode);
              
              // Update the components with the extracted ZIP
              if (components && !components.postal_code) {
                components.postal_code = extractedZipCode;
              }
            }
          }
        }
        
        // No longer validating ZIP code - proceed regardless
        
        // Use the formatted_address from Google's response
        const formattedAddress = place.formatted_address;
        console.log("Using formatted address:", formattedAddress);
        
        // Save address components
        setAddressComponents(components);
        
        // Set both the complete address and extracted zipcode
        setAddress(formattedAddress);
        setZipCode(extractedZipCode);
        
        // Process the address selection
        handleAddressSelection(formattedAddress, extractedZipCode, components);
      };
      
      if (containerRef.current) {
        containerRef.current.addEventListener('place_changed', placeChangedListener);
      }
      
      return () => {
        if (containerRef.current) {
          containerRef.current.removeEventListener('place_changed', placeChangedListener);
        }
      };
    } catch (error) {
      console.error("Error setting up Autocomplete:", error);
      setAutocompleteInitialized(false);
    }
  }, [placesLoaded, quotaExceeded, containerRef, inputRef, setAddress, setZipCode, setAddressComponents, handleAddressSelection, getAddressComponents, getZipCodeFromPlace, setupPlaceAutocomplete, autocompleteInitialized]);

  // When the component mounts, focus the input field for better UX
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, [inputRef]);

  // Reset the initialization state when dependencies change
  useEffect(() => {
    return () => {
      setAutocompleteInitialized(false);
    };
  }, [inputRef]);

  return {
    placesLoaded,
    quotaExceeded,
    containerRef
  };
}
