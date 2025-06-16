
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";

interface AddressInputFormProps {
  address: string;
  handleAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  placesLoaded: boolean;
  quotaExceeded: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  validationError?: string;
}

const AddressInputForm = ({
  address,
  handleAddressChange,
  handleSubmit,
  isLoading,
  inputRef,
  placesLoaded,
  quotaExceeded,
  containerRef,
  validationError
}: AddressInputFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-3 z-10">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="relative w-full">
            <Input
              ref={inputRef}
              type="text"
              value={address}
              onChange={handleAddressChange}
              placeholder="Enter your complete address with ZIP code"
              className={`pl-10 pr-24 py-4 text-lg border-2 transition-all duration-200 ${
                validationError 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-dwellin-sky focus:ring-dwellin-sky'
              }`}
              disabled={isLoading}
            />
            
            {/* Position the autocomplete container */}
            {containerRef.current && (
              <div 
                ref={containerRef} 
                className="absolute top-full left-0 right-0 z-50"
                style={{ 
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  right: '0',
                  zIndex: 50
                }}
              />
            )}
          </div>
          
          <Button 
            type="submit" 
            className="absolute right-2 bg-dwellin-sky hover:bg-dwellin-sky/90 text-white px-4 py-2 rounded-md"
            disabled={isLoading || !address.trim()}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Validation error message */}
        {validationError && (
          <div className="mt-2 text-sm text-red-600 flex items-center">
            <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-center">
              <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {validationError}
            </div>
          </div>
        )}
        
        {quotaExceeded && (
          <div className="mt-2 text-sm text-amber-600">
            <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              Address search is limited. Please type your complete address including ZIP code.
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default AddressInputForm;
