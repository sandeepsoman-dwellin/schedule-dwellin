
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
        
        // Apply custom styles to make it match the requested format
        const containerStyle = `
          .address-suggestions-container {
            background-color: white;
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 0.375rem 0.375rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            max-height: 300px;
            overflow-y: auto;
          }
          
          .suggestion-item {
            display: flex;
            align-items: center;
            padding: 10px 12px;
            border-bottom: 1px solid #f3f4f6;
            cursor: pointer;
          }
          
          .suggestion-item:hover {
            background-color: #f9fafb;
          }
          
          .suggestion-text {
            display: flex;
            align-items: center;
            width: 100%;
            overflow: hidden;
            text-align: left;
          }
          
          .suggestion-main-text {
            font-weight: 500;
            margin-right: 5px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .suggestion-secondary-text {
            color: #6b7280;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        `;
        
        // Add the styles to the document
        const styleEl = document.createElement('style');
        styleEl.textContent = containerStyle;
        document.head.appendChild(styleEl);
        
        // Modify existing suggestion items or set up a mutation observer to apply styles to new items
        const observer = new MutationObserver((mutations) => {
          mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
              const container = document.querySelector('.address-suggestions-container');
              if (container) {
                const items = container.querySelectorAll('.suggestion-item');
                items.forEach(item => {
                  // Ensure the text container has horizontal layout
                  const textContainer = item.querySelector('[style*="flex: 1"]');
                  if (textContainer) {
                    (textContainer as HTMLElement).style.display = 'flex';
                    (textContainer as HTMLElement).style.alignItems = 'center';
                    (textContainer as HTMLElement).style.textAlign = 'left';
                    (textContainer as HTMLElement).style.overflow = 'hidden';
                  }
                });
              }
            }
          });
        });
        
        if (containerRef.current) {
          observer.observe(containerRef.current, { childList: true, subtree: true });
        }
        
        return () => {
          observer.disconnect();
          if (styleEl.parentNode) {
            styleEl.parentNode.removeChild(styleEl);
          }
        };
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
          autoComplete="off" // Disable browser's native autocomplete
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
