
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { placesLoaded, setupPlaceAutocomplete, getAddressComponents, getZipCodeFromPlace, quotaExceeded } = useGooglePlaces();
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  
  // Create a container element for the PlaceAutocompleteElement
  useEffect(() => {
    if (!containerRef.current) {
      const container = document.createElement('div');
      container.id = 'place-autocomplete-container';
      container.style.display = 'none'; // Hide it initially
      document.body.appendChild(container);
      
      containerRef.current = container;
      setContainerElement(container);
      
      return () => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      };
    }
  }, []);
  
  // Set up Places Autocomplete once the Places API is loaded
  useEffect(() => {
    if (!placesLoaded || !containerElement || quotaExceeded) return;
    
    try {
      // Setup the PlaceAutocompleteElement
      setupPlaceAutocomplete(containerElement, inputRef);
      
      // Listen for the place_changed event on the container
      containerElement.addEventListener('place_changed', (event: any) => {
        const place = event.detail.place;
        console.log("Place selected from event:", place);
        
        if (!place.geometry) {
          console.warn("No geometry returned for this place");
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
    } catch (error) {
      console.error("Error setting up PlaceAutocompleteElement:", error);
    }
  }, [placesLoaded, quotaExceeded, containerElement, inputRef, setAddress, setZipCode, setAddressComponents, handleAddressSelection, getAddressComponents, getZipCodeFromPlace, setupPlaceAutocomplete]);

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
    quotaExceeded,
    containerRef
  };
}
