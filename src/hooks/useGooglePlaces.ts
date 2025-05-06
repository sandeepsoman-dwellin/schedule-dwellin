
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
  const googleScriptRef = useRef<HTMLScriptElement | null>(null);
  const googleApiLoadingRef = useRef(false);
  const autocompleteRef = useRef<any>(null);
  const originalConsoleError = console.error;

  // Initialize Google Maps Places API
  useEffect(() => {
    // Only run this effect once
    if (googleApiLoadingRef.current) return;
    googleApiLoadingRef.current = true;
    
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
    
    // Create the script tag with proper async attribute
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC0PUwthcVcCMlhVPbpoCRtEeW0HQgWmbQ&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    googleScriptRef.current = script;
    
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
      
      // Remove the script from the DOM
      if (googleScriptRef.current && googleScriptRef.current.parentNode) {
        googleScriptRef.current.parentNode.removeChild(googleScriptRef.current);
      }
      
      // Only delete the callback if we're truly unmounting
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }
    };
  }, []);

  const setupPlaceAutocomplete = (container: HTMLDivElement, inputRef: React.RefObject<HTMLInputElement>) => {
    if (!placesLoaded || !container || !window.google?.maps?.places) {
      console.log("Places API not loaded yet or container element not available");
      return;
    }
    
    try {
      console.log("Setting up Places PlaceAutocompleteElement");
      
      // Clean up any existing autocomplete
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      // Create the PlaceAutocompleteElement with proper configuration
      const placeAutocompleteElement = document.createElement("gmpx-place-autocomplete-element");
      placeAutocompleteElement.setAttribute("input-placeholder", "Enter your address");
      placeAutocompleteElement.setAttribute("button-label", "Search");
      placeAutocompleteElement.setAttribute("input-label", "");
      
      // Set restrictions to USA addresses only
      placeAutocompleteElement.setAttribute("restrictions", JSON.stringify({
        country: "us",
        type: "address"
      }));
      
      // Add the element to the DOM
      container.appendChild(placeAutocompleteElement);
      
      // Style the element
      placeAutocompleteElement.style.width = "100%";
      placeAutocompleteElement.style.display = "block";
      
      // Store reference for cleanup
      autocompleteRef.current = placeAutocompleteElement;
      
      // Set up event listener for place selection
      placeAutocompleteElement.addEventListener('place_changed', (event: any) => {
        if (!event || !event.detail || !event.detail.place) {
          console.warn("No place data received from event");
          return;
        }
        
        const place = event.detail.place;
        console.log("Place selected:", place);
        
        // If we have an input reference, update its value with the formatted address
        if (inputRef.current && place.formattedAddress) {
          inputRef.current.value = place.formattedAddress;
          
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
    if (!place) {
      console.error("Invalid place object returned");
      return null;
    }
    
    // For PlaceAutocompleteElement, we need to parse differently than the old API
    const components: AddressComponents = {
      formatted_address: place.formattedAddress || "",
    };
    
    // PlaceAutocompleteElement returns data in a different format than Autocomplete
    if (place.addressComponents) {
      place.addressComponents.forEach((component: any) => {
        const types = component.types || [];
        if (types.includes('street_number')) {
          components.street_number = component.longText;
        } else if (types.includes('route')) {
          components.route = component.longText;
        } else if (types.includes('locality')) {
          components.locality = component.longText;
        } else if (types.includes('administrative_area_level_1')) {
          components.administrative_area_level_1 = component.shortText;
        } else if (types.includes('postal_code')) {
          components.postal_code = component.longText;
        } else if (types.includes('country')) {
          components.country = component.shortText;
        }
      });
    }
    
    console.log("Extracted address components:", components);
    return components;
  };

  const getZipCodeFromPlace = (place: any): string | null => {
    if (!place) {
      console.error("Invalid place object returned");
      return null;
    }
    
    // Try to extract zip code from addressComponents
    if (place.addressComponents) {
      const zipCodeComponent = place.addressComponents.find(
        (component: any) => component.types && component.types.includes('postal_code')
      );
      
      if (zipCodeComponent) {
        const extractedZipCode = zipCodeComponent.longText;
        console.log("ZIP code extracted:", extractedZipCode);
        return extractedZipCode;
      }
    }
    
    // Fallback: try to extract zip code from formattedAddress using regex
    if (place.formattedAddress) {
      const zipRegex = /\b\d{5}\b/;
      const match = place.formattedAddress.match(zipRegex);
      if (match && match[0]) {
        console.log("ZIP code extracted from formatted address:", match[0]);
        return match[0];
      }
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
