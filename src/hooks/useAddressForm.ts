
import { useState } from "react";
import { AddressComponents, extractZipCode, validateZipCode, storeZipCode } from "@/hooks/useGooglePlaces";
import { toast } from "sonner";

interface UseAddressFormProps {
  onAddressSelect: (address: string, zipCode: string, addressComponents?: AddressComponents) => void;
}

export function useAddressForm({ onAddressSelect }: UseAddressFormProps) {
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [addressComponents, setAddressComponents] = useState<AddressComponents | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
    
    // Try to extract ZIP code as user types
    const extractedZip = extractZipCode(value);
    if (extractedZip && validateZipCode(extractedZip)) {
      setZipCode(extractedZip);
      setValidationError(""); // Clear error if valid ZIP found
    }
  };

  const handleAddressSelection = (selectedAddress: string, selectedZipCode: string, components?: AddressComponents) => {
    console.log("=== ADDRESS SELECTION ===");
    console.log("Selected address:", selectedAddress);
    console.log("Selected ZIP code:", selectedZipCode);
    console.log("Address components:", components);
    
    // Clear any existing validation errors immediately
    setValidationError("");
    
    // Update state
    setAddress(selectedAddress);
    setZipCode(selectedZipCode);
    setAddressComponents(components || null);
    
    // For autocomplete selections, always proceed if we have any ZIP code
    if (selectedZipCode && validateZipCode(selectedZipCode)) {
      // Store the ZIP code with validation
      const stored = storeZipCode(selectedZipCode, selectedAddress);
      if (!stored) {
        toast.error("Failed to store address information");
        return;
      }
      
      // Store address components if available
      if (components) {
        try {
          const componentsString = JSON.stringify(components);
          sessionStorage.setItem("addressComponents", componentsString);
          localStorage.setItem("addressComponents", componentsString);
        } catch (error) {
          console.error("Failed to store address components:", error);
        }
      }
      
      // Call the callback immediately for valid autocomplete selections
      onAddressSelect(selectedAddress, selectedZipCode, components);
    } else {
      console.error("Invalid ZIP code in address selection:", selectedZipCode);
      setValidationError("Please select an address with a valid ZIP code");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setValidationError(""); // Clear any existing errors
    
    try {
      // Enhanced manual address processing
      let finalZipCode = zipCode;
      
      // If no ZIP code extracted yet, try one more time
      if (!finalZipCode) {
        finalZipCode = extractZipCode(address) || '';
      }
      
      // For manual entry, validate more strictly
      if (!finalZipCode || !validateZipCode(finalZipCode)) {
        const errorMessage = "Please enter a complete address with a valid 5-digit ZIP code";
        setValidationError(errorMessage);
        setIsLoading(false);
        return;
      }
      
      console.log("Manual address submission:", { address, finalZipCode });
      
      // Store the ZIP code
      const stored = storeZipCode(finalZipCode, address);
      if (!stored) {
        setValidationError("Failed to store address information");
        setIsLoading(false);
        return;
      }
      
      // Create basic address components for manual entry
      const manualComponents: AddressComponents = {
        formatted_address: address,
        postal_code: finalZipCode
      };
      
      setAddressComponents(manualComponents);
      
      // Clear validation error on successful submission
      setValidationError("");
      
      // Call the callback
      onAddressSelect(address, finalZipCode, manualComponents);
      
    } catch (error) {
      console.error("Error in manual address submission:", error);
      setValidationError("Please check your address and try again");
    } finally {
      setIsLoading(false);
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
    validationError,
    setValidationError,
    handleAddressChange,
    handleAddressSelection,
    handleSubmit
  };
}
