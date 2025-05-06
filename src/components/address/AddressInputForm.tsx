
import React, { useRef } from "react";
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
  // Reference for the autocomplete position wrapper
  const autocompletePositionRef = useRef<HTMLDivElement>(null);
  
  // Function to handle elements when they mount
  React.useEffect(() => {
    // If we have a containerRef and its current, and we have a position ref, set up the autocomplete
    if (containerRef?.current && autocompletePositionRef.current && placesLoaded && !quotaExceeded) {
      // Clear previous contents
      if (autocompletePositionRef.current.firstChild !== containerRef.current) {
        autocompletePositionRef.current.innerHTML = '';
        autocompletePositionRef.current.appendChild(containerRef.current);
      }
      
      // Find the custom element within the container
      const autocompleteElement = containerRef.current.querySelector('gmpx-place-autocomplete-element');
      
      if (autocompleteElement) {
        // Apply essential styles to make it work with our form design
        const element = autocompleteElement as HTMLElement;
        
        // Hide the input field from the autocomplete element as we're using our own
        const styleTag = document.createElement('style');
        styleTag.textContent = `
          gmpx-place-autocomplete-element::part(input-container) {
            display: none !important;
          }

          gmpx-place-autocomplete-element::part(suggestions-container) {
            position: absolute !important;
            top: 100% !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            max-height: 300px !important;
            overflow-y: auto !important;
            z-index: 1000 !important;
            background-color: white !important;
            border: 1px solid #e2e8f0 !important;
            border-top: none !important;
            border-radius: 0 0 0.375rem 0.375rem !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          }

          gmpx-place-autocomplete-element::part(suggestion) {
            padding: 8px 12px !important;
            cursor: pointer !important;
          }

          gmpx-place-autocomplete-element::part(suggestion):hover {
            background-color: #f7fafc !important;
          }

          gmpx-place-autocomplete-element::part(button) {
            display: none !important;
          }

          .pac-logo:after {
            display: none !important;
          }
        `;

        // Add the style to the document head
        document.head.appendChild(styleTag);
        
        // Make sure the element is visible and properly sized
        element.style.width = '100%';
        element.style.display = 'block';
        element.style.position = 'relative';
        element.style.zIndex = '50';
      }
    }
  }, [containerRef, autocompletePositionRef, placesLoaded, quotaExceeded]);

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
          onClick={() => {
            // Trigger focus on the input to show autocomplete results
            const autocompleteParts = containerRef?.current?.querySelector('gmpx-place-autocomplete-element');
            if (autocompleteParts) {
              // Focus any input field within the autocomplete element
              const inputField = (autocompleteParts as HTMLElement).querySelector('input');
              if (inputField) {
                inputField.focus();
              }
            }
          }}
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
      
      {/* Position container for Google Places autocomplete suggestions */}
      <div ref={autocompletePositionRef} className="absolute left-0 right-0 z-40"></div>
      
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
