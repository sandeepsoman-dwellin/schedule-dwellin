
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

// Define Google Maps types
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export interface AddressComponents {
  street_number?: string;
  route?: string;
  locality?: string;
  administrative_area_level_1?: string;
  postal_code?: string;
  formatted_address: string;
  country?: string;
}

export interface GooglePlacesHookResult {
  placesLoaded: boolean;
  setupPlaceAutocomplete: (container: HTMLDivElement, inputRef: React.RefObject<HTMLInputElement>) => void;
  getAddressComponents: (place: any) => AddressComponents | null;
  getZipCodeFromPlace: (place: any) => string | null;
  quotaExceeded: boolean;
}

export function useGooglePlaces(): GooglePlacesHookResult {
  const [placesLoaded, setPlacesLoaded] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const googleScriptRef = useRef<boolean>(false);
  const autocompleteRef = useRef<any>(null);
  const originalConsoleError = console.error;

  // Initialize Google Maps Places API
  useEffect(() => {
    // Only run this effect once
    if (googleScriptRef.current) return;
    
    // Mark that we've started loading the script
    googleScriptRef.current = true;
    
    // If already loaded, just set the state
    if (window.google?.maps?.places) {
      console.log("Google Maps already loaded");
      setPlacesLoaded(true);
      return;
    }
    
    // Override console.error to detect quota errors
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      if (errorMessage.includes('exceeded your daily request quota')) {
        setQuotaExceeded(true);
        toast.error("Address search is limited due to API quota. Please type your full address including ZIP code manually.");
      }
      originalConsoleError.apply(console, args);
    };
    
    // Define the callback function
    window.initGoogleMaps = () => {
      console.log("Google Maps Places API loaded successfully");
      setPlacesLoaded(true);
    };
    
    // Create the script tag
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC0PUwthcVcCMlhVPbpoCRtEeW0HQgWmbQ&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Handle script loading errors
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
      toast.error("Address search is currently unavailable");
    };
    
    // Append the script to the DOM
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Restore original console.error
      console.error = originalConsoleError;
      
      // Check if script exists before trying to remove it
      const scriptElement = document.getElementById('google-maps-script');
      if (scriptElement) {
        scriptElement.remove();
      }
      
      // Only delete the callback if we're truly unmounting
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }
    };
  }, []);

  const setupPlaceAutocomplete = (container: HTMLDivElement, inputRef: React.RefObject<HTMLInputElement>) => {
    if (!placesLoaded || !container) {
      console.log("Places not loaded yet or container element not available");
      return;
    }
    
    try {
      console.log("Setting up Places PlaceAutocompleteElement");
      
      // Clean up any existing autocomplete
      if (autocompleteRef.current) {
        container.innerHTML = '';
      }
      
      // Create the PlaceAutocompleteElement
      const placeAutocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address', 'geometry'],
      });
      
      // Add the element to the DOM
      container.appendChild(placeAutocompleteElement);
      
      // Store reference for cleanup
      autocompleteRef.current = placeAutocompleteElement;
      
      // Set up event listener for place selection
      placeAutocompleteElement.addEventListener('place_changed', (event: any) => {
        const place = event.detail.place;
        console.log("Place selected:", place);
        
        if (!place.geometry) {
          console.warn("No geometry returned for this place");
          return;
        }
        
        // If we have an input reference, update its value with the formatted address
        if (inputRef.current) {
          inputRef.current.value = place.formatted_address || "";
          
          // Manually trigger an input event to update React state
          const inputEvent = new Event('input', { bubbles: true });
          inputRef.current.dispatchEvent(inputEvent);
        }
      });
      
      console.log("PlaceAutocompleteElement setup complete");
    } catch (error) {
      console.error("Error initializing Places PlaceAutocompleteElement:", error);
      toast.error("There was a problem with address search. Please try typing your address manually.");
    }
  };

  const getAddressComponents = (place: any): AddressComponents | null => {
    if (!place || !place.address_components) {
      console.error("Invalid place object returned");
      return null;
    }
    
    const components: AddressComponents = {
      formatted_address: place.formatted_address || "",
    };
    
    // Map address components to their appropriate fields
    place.address_components.forEach((component: any) => {
      if (component.types.includes('street_number')) {
        components.street_number = component.long_name;
      } else if (component.types.includes('route')) {
        components.route = component.long_name;
      } else if (component.types.includes('locality')) {
        components.locality = component.long_name;
      } else if (component.types.includes('administrative_area_level_1')) {
        components.administrative_area_level_1 = component.short_name;
      } else if (component.types.includes('postal_code')) {
        components.postal_code = component.long_name;
      } else if (component.types.includes('country')) {
        components.country = component.short_name;
      }
    });
    
    console.log("Extracted address components:", components);
    return components;
  };

  const getZipCodeFromPlace = (place: any): string | null => {
    if (!place || !place.address_components) {
      console.error("Invalid place object returned");
      return null;
    }
    
    // Extract the zipcode (postal_code) from address components
    const zipCodeComponent = place.address_components.find(
      (component: any) => component.types.includes('postal_code')
    );
    
    if (zipCodeComponent) {
      const extractedZipCode = zipCodeComponent.long_name;
      console.log("ZIP code extracted:", extractedZipCode);
      return extractedZipCode;
    }
    
    return null;
  };

  return {
    placesLoaded,
    setupPlaceAutocomplete,
    getAddressComponents,
    getZipCodeFromPlace,
    quotaExceeded
  };
}
