
import React from "react";
import { useNavigate } from "react-router-dom";
import AddressInput from "@/components/AddressInput";
import { AddressComponents } from "@/hooks/useGooglePlaces";

interface AddressSearchProps {
  onSubmit: (zipCode: string, addressComponents?: AddressComponents) => void;
  autoNavigate?: boolean;
}

const AddressSearch = ({ onSubmit, autoNavigate = false }: AddressSearchProps) => {
  const navigate = useNavigate();

  const handleAddressSelected = (address: string, zipCode: string, addressComponents?: AddressComponents) => {
    // Extract the zipCode from address components
    let extractedZipCode = '';
    
    console.log("Selected address:", address);
    console.log("Initial ZIP code:", zipCode);
    console.log("Address components:", addressComponents);
    
    // First check if postal_code exists in components
    if (addressComponents?.postal_code) {
      extractedZipCode = addressComponents.postal_code;
      console.log('Found ZIP code in address components:', extractedZipCode);
    } else if (zipCode) {
      // Use provided zipCode if address components don't have postal_code
      extractedZipCode = zipCode;
      console.log('Using provided ZIP code:', extractedZipCode);
    }
    
    // CRITICAL: Always store in session storage if we have a valid ZIP code
    if (extractedZipCode) {
      sessionStorage.setItem("zipCode", extractedZipCode);
      console.log('CRITICAL - Saved ZIP code to session storage:', extractedZipCode);
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
