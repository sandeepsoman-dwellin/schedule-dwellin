
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";

interface AddressSearchProps {
  onSubmit: (zipCode: string) => void;
}

const AddressSearch = ({ onSubmit }: AddressSearchProps) => {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Extract zipcode from address (mock implementation)
    // In a real implementation, we would use Google Places API to extract zipcode
    const zipCodeRegex = /\b\d{5}\b/;
    const match = address.match(zipCodeRegex);
    const zipCode = match ? match[0] : "10001"; // Default to NYC if no zip found
    
    setTimeout(() => {
      setIsLoading(false);
      onSubmit(zipCode);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your address"
          className="pl-10 py-6 text-base"
          required
        />
        <Button 
          type="submit" 
          className="absolute right-1 top-1 bottom-1 px-4 bg-dwellin-sky hover:bg-opacity-90 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddressSearch;
