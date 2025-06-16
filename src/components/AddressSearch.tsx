
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddressInput from "@/components/AddressInput";
import { AddressComponents, validateZipCode, storeZipCode } from "@/hooks/useGooglePlaces";
import { toast } from "sonner";

interface AddressSearchProps {
  onSubmit: (zipCode: string, addressComponents?: AddressComponents) => void;
  autoNavigate?: boolean;
}

const AddressSearch = ({ onSubmit, autoNavigate = false }: AddressSearchProps) => {
  const navigate = useNavigate();

  // Debug the existing ZIP code when component mounts
  useEffect(() => {
    const sessionZipCode = sessionStorage.getItem("zipCode");
    console.log("AddressSearch - Initial session ZIP code:", sessionZipCode);
    console.log("AddressSearch - ZIP code valid:", validateZipCode(sessionZipCode || ''));
  }, []);

  const handleAddressSelected = (address: string, zipCode: string, addressComponents?: AddressComponents) => {
    console.log("=== ADDRESS SEARCH SUBMISSION ===");
    console.log("Selected address:", address);
    console.log("ZIP code:", zipCode);
    console.log("Address components:", addressComponents);
    
    // Enhanced ZIP code extraction and validation
    let extractedZipCode = '';
    
    // Use the provided zipCode if it's valid
    if (zipCode && validateZipCode(zipCode)) {
      extractedZipCode = zipCode;
      console.log('Using provided valid ZIP code:', extractedZipCode);
    } else if (addressComponents?.postal_code && validateZipCode(addressComponents.postal_code)) {
      // Fallback to postal_code from components
      extractedZipCode = addressComponents.postal_code;
      console.log('Found valid ZIP code in address components:', extractedZipCode);
    } else {
      console.error("No valid ZIP code found in address selection");
      toast.error("Please select an address with a valid ZIP code");
      return;
    }
    
    // CRITICAL: Always store in session storage if we have a valid ZIP code
    const stored = storeZipCode(extractedZipCode, address);
    if (!stored) {
      toast.error("Failed to store address information");
      return;
    }
    
    // Store address components as JSON string if available
    if (addressComponents) {
      try {
        const componentsString = JSON.stringify(addressComponents);
        sessionStorage.setItem("addressComponents", componentsString);
        localStorage.setItem("addressComponents", componentsString);
      } catch (error) {
        console.error("Failed to store address components:", error);
      }
    }
    
    if (autoNavigate) {
      console.log('Navigating to services with ZIP:', extractedZipCode);
      navigate(`/services?zip=${extractedZipCode}`);
    } else {
      // Use the provided onSubmit handler with address components
      onSubmit(extractedZipCode, addressComponents);
    }
  };

  return <AddressInput onAddressSelect={handleAddressSelected} />;
};

export default AddressSearch;
