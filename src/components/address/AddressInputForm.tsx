
import React, { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, AlertCircle } from "lucide-react";

interface AddressInputFormProps {
  address: string;
  handleAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  placesLoaded: boolean;
  quotaExceeded: boolean;
  containerRef?: React.RefObject<HTMLDivElement>;
}

const AddressInputForm: React.FC<AddressInputFormProps> = ({
  address,
  handleAddressChange,
  handleSubmit,
  isLoading,
  inputRef,
  placesLoaded,
  quotaExceeded,
  containerRef
}) => {
  const autocompleteWrapperRef = useRef<HTMLDivElement>(null);
  
  // Effect to position and style the autocomplete container properly
  useEffect(() => {
    if (!containerRef?.current || !autocompleteWrapperRef.current) return;
    
    // Clear any previous content
    autocompleteWrapperRef.current.innerHTML = '';
    
    // Append the autocomplete container to our wrapper div
    autocompleteWrapperRef.current.appendChild(containerRef.current);
    
    // Style the Google autocomplete element correctly
    const placeElement = containerRef.current.querySelector('gmpx-place-autocomplete-element');
    if (placeElement) {
      // Apply styling to the element
      const element = placeElement as HTMLElement;
      element.style.width = '100%';
      element.style.display = 'block';
      element.style.zIndex = '50';
      
      // Target the shadow DOM to style the input within
      setTimeout(() => {
        const shadowRoot = element.shadowRoot;
        if (shadowRoot) {
          // Add custom styles to the shadow DOM
          const style = document.createElement('style');
          style.textContent = `
            .pac-container {
              width: 100% !important;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              border-radius: 0.375rem;
              border: 1px solid #e2e8f0;
              z-index: 50;
              background-color: white;
            }
            input {
              display: none !important;
            }
            .pac-logo:after {
              display: none !important;
            }
          `;
          shadowRoot.appendChild(style);
        }
      }, 100);
    }
  }, [containerRef, placesLoaded]);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder={quotaExceeded ? "Enter full address with ZIP code (e.g. 123 Main St, City, 12345)" : "Enter your address"}
          className="pl-10 py-6 text-base"
          required
          ref={inputRef}
        />
        {!placesLoaded && !quotaExceeded && (
          <div className="absolute inset-y-0 right-12 flex items-center">
            <div className="h-4 w-4 border-t-2 border-b-2 border-dwellin-sky rounded-full animate-spin" />
          </div>
        )}
        <Button 
          type="submit" 
          className="absolute right-1 top-1 bottom-1 px-4 bg-dwellin-sky hover:bg-opacity-90 text-white z-10"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      {/* Container for Google Places autocomplete suggestions */}
      <div ref={autocompleteWrapperRef} className="absolute left-0 right-0 z-40"></div>
      
      {quotaExceeded && (
        <div className="mt-2 flex items-center text-amber-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          <p className="text-sm">Address autocomplete is limited. Please type your full address including ZIP code.</p>
        </div>
      )}
      {!placesLoaded && !quotaExceeded && (
        <p className="text-sm text-gray-500 mt-2">Loading address search...</p>
      )}
    </form>
  );
};

export default AddressInputForm;
