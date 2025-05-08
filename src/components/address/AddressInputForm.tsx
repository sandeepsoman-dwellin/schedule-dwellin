
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
