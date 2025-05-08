
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
  getPlacePredictions: (input: string) => Promise<any[]>;
}

export function useGooglePlaces(): GooglePlacesHookResult {
  const [placesLoaded, setPlacesLoaded] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const googleScriptRef = useRef<HTMLScriptElement | null>(null);
  const googleApiLoadingRef = useRef(false);
  const autocompleteRef = useRef<any>(null);
  const autocompleteServiceRef = useRef<any>(null);
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
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
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
      
      // Initialize AutocompleteService when API is ready
      if (window.google?.maps?.places) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      }
    };
    
    // Create the script tag with proper async and loading attributes
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC0PUwthcVcCMlhVPbpoCRtEeW0HQgWmbQ&libraries=places&callback=initGoogleMaps&loading=async`;
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

  // Function to get place predictions using AutocompleteService
  const getPlacePredictions = async (input: string): Promise<any[]> => {
    if (!placesLoaded || !autocompleteServiceRef.current) {
      return [];
    }

    try {
      return new Promise((resolve, reject) => {
        const request = {
          input: input,
          componentRestrictions: { country: 'us' },
          types: ['address']
        };

        autocompleteServiceRef.current.getPlacePredictions(
          request,
          (predictions: any[], status: string) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              resolve(predictions);
            } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              resolve([]);
            } else if (status === window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
              setQuotaExceeded(true);
              reject("API quota exceeded");
            } else {
              reject(status);
            }
          }
        );
      });
    } catch (error) {
      console.error("Error getting place predictions:", error);
      return [];
    }
  };

  const setupPlaceAutocomplete = (container: HTMLDivElement, inputRef: React.RefObject<HTMLInputElement>) => {
    if (!placesLoaded || !container || !window.google?.maps?.places) {
      console.log("Places API not loaded yet or container element not available");
      return;
    }
    
    try {
      console.log("Setting up Place Autocomplete");
      
      // Clean up any existing autocomplete
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      // Create suggestions container
      const suggestionsContainer = document.createElement('div');
      suggestionsContainer.className = 'address-suggestions-container';
      suggestionsContainer.style.display = 'none';
      suggestionsContainer.style.position = 'absolute';
      suggestionsContainer.style.top = '100%';
      suggestionsContainer.style.left = '0';
      suggestionsContainer.style.right = '0';
      suggestionsContainer.style.width = '100%';
      suggestionsContainer.style.maxHeight = '300px';
      suggestionsContainer.style.overflowY = 'auto';
      suggestionsContainer.style.zIndex = '1000';
      suggestionsContainer.style.backgroundColor = 'white';
      suggestionsContainer.style.border = '1px solid #e2e8f0';
      suggestionsContainer.style.borderTop = 'none';
      suggestionsContainer.style.borderRadius = '0 0 0.375rem 0.375rem';
      suggestionsContainer.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      
      container.appendChild(suggestionsContainer);
      
      // Set up input event listener if we have an input reference
      if (inputRef.current) {
        // Initialize PlacesService for getting place details
        const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
        
        let debounceTimer: number;
        
        // Helper to render suggestions
        const renderSuggestions = (predictions: any[]) => {
          suggestionsContainer.innerHTML = '';
          
          if (predictions.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
          }
          
          predictions.forEach(prediction => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = prediction.description;
            item.style.padding = '8px 12px';
            item.style.cursor = 'pointer';
            
            item.addEventListener('mouseenter', () => {
              item.style.backgroundColor = '#f7fafc';
            });
            
            item.addEventListener('mouseleave', () => {
              item.style.backgroundColor = 'transparent';
            });
            
            item.addEventListener('click', () => {
              if (inputRef.current) {
                inputRef.current.value = prediction.description;
                
                // Get place details
                placesService.getDetails(
                  { placeId: prediction.place_id, fields: ['address_components', 'formatted_address', 'geometry'] },
                  (place: any, status: string) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                      // Create a synthetic event that matches the place_changed event format
                      const placeChangedEvent = new CustomEvent('place_changed', {
                        detail: { place }
                      });
                      
                      // Dispatch the event on the container
                      container.dispatchEvent(placeChangedEvent);
                    }
                  }
                );
              }
              
              // Hide suggestions
              suggestionsContainer.style.display = 'none';
            });
            
            suggestionsContainer.appendChild(item);
          });
          
          suggestionsContainer.style.display = 'block';
        };
        
        // Set up input event listener
        inputRef.current.addEventListener('input', (e: Event) => {
          const target = e.target as HTMLInputElement;
          const value = target.value;
          
          // Clear previous timer
          clearTimeout(debounceTimer);
          
          if (value.length < 3) {
            suggestionsContainer.style.display = 'none';
            return;
          }
          
          // Set new timer for debounce (300ms)
          debounceTimer = window.setTimeout(async () => {
            try {
              const predictions = await getPlacePredictions(value);
              renderSuggestions(predictions);
            } catch (error) {
              console.error('Failed to get predictions:', error);
              suggestionsContainer.style.display = 'none';
            }
          }, 300);
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e: MouseEvent) => {
          if (!container.contains(e.target as Node)) {
            suggestionsContainer.style.display = 'none';
          }
        });
        
        // Show suggestions on focus if there's text and previous results
        inputRef.current.addEventListener('focus', () => {
          if (inputRef.current?.value.length >= 3 && suggestionsContainer.childElementCount > 0) {
            suggestionsContainer.style.display = 'block';
          }
        });
        
        console.log("Autocomplete setup complete with AutocompleteService");
      }
    } catch (error) {
      console.error("Error initializing Places Autocomplete:", error);
      toast.error("There was a problem with address search. Please try typing your address manually.");
    }
  };

  const getAddressComponents = (place: any): AddressComponents | null => {
    if (!place) {
      console.error("Invalid place object returned");
      return null;
    }
    
    const components: AddressComponents = {
      formatted_address: place.formatted_address || "",
    };
    
    // Process address components
    if (place.address_components) {
      place.address_components.forEach((component: any) => {
        const types = component.types || [];
        if (types.includes('street_number')) {
          components.street_number = component.long_name;
        } else if (types.includes('route')) {
          components.route = component.long_name;
        } else if (types.includes('locality')) {
          components.locality = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          components.administrative_area_level_1 = component.short_name;
        } else if (types.includes('postal_code')) {
          components.postal_code = component.long_name;
        } else if (types.includes('country')) {
          components.country = component.short_name;
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
    
    // Try to extract zip code from address_components
    if (place.address_components) {
      const zipCodeComponent = place.address_components.find(
        (component: any) => component.types && component.types.includes('postal_code')
      );
      
      if (zipCodeComponent) {
        const extractedZipCode = zipCodeComponent.long_name;
        console.log("ZIP code extracted:", extractedZipCode);
        return extractedZipCode;
      }
    }
    
    // Fallback: try to extract zip code from formatted_address using regex
    if (place.formatted_address) {
      const zipRegex = /\b\d{5}\b/;
      const match = place.formatted_address.match(zipRegex);
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
    quotaExceeded,
    getPlacePredictions
  };
}
