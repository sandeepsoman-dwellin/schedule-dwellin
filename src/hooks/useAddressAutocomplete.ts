
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
  
  // Create a container element for the PlaceAutocompleteElement
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
      // Setup the PlaceAutocompleteElement
      setupPlaceAutocomplete(containerRef.current, inputRef);
      setAutocompleteInitialized(true);
      
      // Listen for the place_changed event on the container
      const placeChangedListener = (event: any) => {
        if (!event.detail || !event.detail.place) {
          console.warn("No place returned from event");
          return;
        }
        
        const place = event.detail.place;
        console.log("Place selected from event:", place);
        
        // Extract address components
        const components = getAddressComponents(place);
        
        if (!components) {
          toast.error("Couldn't retrieve address details. Please try another address.");
          return;
        }
        
        const extractedZipCode = components?.postal_code || getZipCodeFromPlace(place);
        
        if (!extractedZipCode) {
          toast.error("Couldn't find a ZIP code for this address. Please try another address.");
          return;
        }
        
        // Ensure we have all required components
        const hasStreetNumber = !!components.street_number;
        const hasStreetName = !!components.route;
        const hasCity = !!components.locality;
        const hasState = !!components.administrative_area_level_1;
        const hasZip = !!extractedZipCode;
        
        if (!hasStreetNumber || !hasStreetName || !hasCity || !hasState || !hasZip) {
          toast.warning("Address may be incomplete. Please verify all details are correct.");
        }
        
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
        
        // Use the formatted address from Google if we couldn't build one ourselves
        if (!formattedAddress && place.formattedAddress) {
          formattedAddress = place.formattedAddress;
        }
        
        console.log("Formatted address:", formattedAddress);
        
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
      console.error("Error setting up PlaceAutocompleteElement:", error);
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
