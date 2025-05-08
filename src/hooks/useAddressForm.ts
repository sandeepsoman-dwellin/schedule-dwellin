
import { useState, FormEvent, ChangeEvent, useEffect } from "react";
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
  useEffect(() => {
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
  }, []);

  // Improved function to extract zip code from address string
  const extractZipCodeFromAddress = (addressText: string): string | null => {
    // Match standard 5-digit US ZIP code or ZIP+4 format
    const zipCodeRegex = /\b\d{5}(?:-\d{4})?\b/g;
    const matches = Array.from(addressText.matchAll(zipCodeRegex));
    
    if (matches && matches.length > 0) {
      // Get the last match, which is likely the actual zip code (not street numbers)
      const extractedZip = matches[matches.length - 1][0];
      console.log("ZIP code extracted:", extractedZip);
      return extractedZip.substring(0, 5); // Return only first 5 digits
    }
    
    return null;
  };

  const handleAddressSelection = (
    selectedAddress: string, 
    selectedZipCode: string, 
    components?: AddressComponents
  ) => {
    setIsLoading(true);
    
    // Extract ZIP code if not already provided
    let extractedZipCode = selectedZipCode;
    if (!extractedZipCode || extractedZipCode.trim() === '') {
      // Try to extract from the address string
      extractedZipCode = extractZipCodeFromAddress(selectedAddress) || '';
      console.log("ZIP code extracted from selection:", extractedZipCode);
    }

    // Validate zip code
    if (!extractedZipCode || !/^\d{5}$/.test(extractedZipCode)) {
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
      
      // Store the extracted zip code in components if missing
      if (!components.postal_code && extractedZipCode) {
        components.postal_code = extractedZipCode;
      }
      
      // Save address components to sessionStorage
      sessionStorage.setItem("addressComponents", JSON.stringify(components));
      localStorage.setItem("addressComponents", JSON.stringify(components));
    }

    // Save address to sessionStorage
    sessionStorage.setItem("customerAddress", selectedAddress);
    sessionStorage.setItem("zipCode", extractedZipCode);
    localStorage.setItem("customerAddress", selectedAddress);
    localStorage.setItem("zipCode", extractedZipCode);

    // Submit the address and zip code
    setTimeout(() => {
      setIsLoading(false);
      onAddressSelect(selectedAddress, extractedZipCode, components);
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
    const extractedZipCode = extractZipCodeFromAddress(address);
    
    if (!extractedZipCode) {
      toast.error("Please enter an address with a valid ZIP code");
      return;
    }
    
    console.log("ZIP code extracted from manual entry:", extractedZipCode);
    setZipCode(extractedZipCode);
    
    // Try to parse out address components from manual entry
    // Basic format expected: "Street number Street name, City, State Zip"
    let streetNumber = "";
    let streetName = "";
    let city = "";
    let state = "";
    
    const parts = address.split(',');
    if (parts.length >= 3) {
      // Extract street info
      const streetPart = parts[0].trim();
      const firstSpaceIndex = streetPart.indexOf(' ');
      if (firstSpaceIndex !== -1 && !isNaN(Number(streetPart.substring(0, firstSpaceIndex)))) {
        streetNumber = streetPart.substring(0, firstSpaceIndex);
        streetName = streetPart.substring(firstSpaceIndex + 1);
      } else {
        streetName = streetPart;
      }
      
      // Extract city
      city = parts[1].trim();
      
      // Extract state
      const stateZipParts = parts[2].trim().split(' ');
      if (stateZipParts.length >= 1) {
        state = stateZipParts[0];
      }
    }
    
    // Create a simple address components object for manual entry
    const manualComponents: AddressComponents = {
      street_number: streetNumber,
      route: streetName,
      locality: city,
      administrative_area_level_1: state,
      postal_code: extractedZipCode,
      formatted_address: address,
      country: "US"
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
