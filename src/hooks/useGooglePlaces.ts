
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

// Define Google Maps types
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export interface GooglePlacesHookResult {
  placesLoaded: boolean;
  setupAutocomplete: (inputElement: HTMLInputElement) => void;
  getZipCodeFromPlace: (place: any) => string | null;
  quotaExceeded: boolean;
}

export function useGooglePlaces(): GooglePlacesHookResult {
  const [placesLoaded, setPlacesLoaded] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const googleScriptRef = useRef<boolean>(false);
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

  const setupAutocomplete = (inputElement: HTMLInputElement) => {
    if (!placesLoaded || !inputElement) {
      console.log("Places not loaded yet or input element not available");
      return null;
    }
    
    try {
      console.log("Setting up Places Autocomplete");
      
      // Create the autocomplete object with US addresses only
      const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address', 'geometry'],
      });
      
      console.log("Autocomplete setup complete");
      return autocomplete;
    } catch (error) {
      console.error("Error initializing Places Autocomplete:", error);
      toast.error("There was a problem with address search. Please try typing your address manually.");
      return null;
    }
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
    setupAutocomplete,
    getZipCodeFromPlace,
    quotaExceeded
  };
}
