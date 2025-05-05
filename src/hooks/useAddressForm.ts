
import { useState, FormEvent, ChangeEvent } from "react";
import { toast } from "sonner";
import { AddressComponents } from "@/hooks/useGooglePlaces";

interface UseAddressFormProps {
  onAddressSelect: (address: string, zipCode: string, addressComponents?: AddressComponents) => void;
}

export function useAddressForm({ onAddressSelect }: UseAddressFormProps) {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const [addressComponents, setAddressComponents] = useState<AddressComponents | null>(null);
  
  // Load address from sessionStorage if available
  useState(() => {
    const storedAddress = sessionStorage.getItem("customerAddress");
    const storedZipCode = sessionStorage.getItem("zipCode");
    const storedComponents = sessionStorage.getItem("addressComponents");
    
    if (storedAddress && storedZipCode) {
      setAddress(storedAddress);
      setZipCode(storedZipCode);
      
      if (storedComponents) {
        try {
          setAddressComponents(JSON.parse(storedComponents));
        } catch (e) {
          console.error("Error parsing stored address components:", e);
        }
      }
    }
  });

  const handleAddressSelection = (
    selectedAddress: string, 
    selectedZipCode: string, 
    components?: AddressComponents
  ) => {
    setIsLoading(true);
    
    // Validate zip code
    if (!/^\d{5}$/.test(selectedZipCode)) {
      toast.error("Please enter a valid 5-digit ZIP code");
      setIsLoading(false);
      return;
    }

    // Ensure all required components are present
    if (components) {
      const hasStreet = !!(components.street_number && components.route);
      const hasCity = !!components.locality;
      const hasState = !!components.administrative_area_level_1;
      
      if (!hasStreet || !hasCity || !hasState) {
        toast.warning("Address may be incomplete. Please check that it contains street, city, and state.");
      }
      
      // Save address components to sessionStorage
      sessionStorage.setItem("addressComponents", JSON.stringify(components));
      localStorage.setItem("addressComponents", JSON.stringify(components));
    }

    // Ensure ZIP code is included in the displayed address
    if (!selectedAddress.includes(selectedZipCode)) {
      selectedAddress += ` ${selectedZipCode}`;
    }

    // Save address to sessionStorage
    sessionStorage.setItem("customerAddress", selectedAddress);
    sessionStorage.setItem("zipCode", selectedZipCode);
    localStorage.setItem("customerAddress", selectedAddress);
    localStorage.setItem("zipCode", selectedZipCode);

    // Submit the address and zip code
    setTimeout(() => {
      setIsLoading(false);
      onAddressSelect(selectedAddress, selectedZipCode, components);
    }, 500);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error("Please enter an address");
      return;
    }

    // If we already have a zip code from autocomplete, use it
    if (zipCode && addressComponents) {
      handleAddressSelection(address, zipCode, addressComponents);
      return;
    }

    // Extract zipcode from address (fallback if autocomplete not used)
    const zipCodeRegex = /\b\d{5}\b/;
    const match = address.match(zipCodeRegex);
    
    if (!match) {
      toast.error("Please enter an address with a valid ZIP code");
      return;
    }
    
    const extractedZipCode = match[0];
    console.log("ZIP code extracted from manual entry:", extractedZipCode);
    setZipCode(extractedZipCode);
    
    // Create a simple address components object for manual entry
    const manualComponents: AddressComponents = {
      postal_code: extractedZipCode,
      formatted_address: address
    };
    
    handleAddressSelection(address, extractedZipCode, manualComponents);
  };

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    // If the text changes, clear the stored zipCode to prevent using stale data
    if (zipCode && !e.target.value.includes(zipCode)) {
      setZipCode("");
      setAddressComponents(null);
    }
  };

  return {
    address,
    setAddress,
    zipCode,
    setZipCode,
    addressComponents,
    setAddressComponents,
    isLoading,
    setIsLoading,
    handleAddressChange,
    handleAddressSelection,
    handleSubmit,
  };
}
