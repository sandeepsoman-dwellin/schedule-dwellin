
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
    const extractedZipCode = zipCode || (addressComponents?.postal_code || '');
    
    // Store in session storage
    if (extractedZipCode) {
      sessionStorage.setItem("zipCode", extractedZipCode);
      console.log('Saved ZIP code to session:', extractedZipCode);
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
