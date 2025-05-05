
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
    if (autoNavigate) {
      // Directly navigate to services page with the zip code
      navigate(`/services?zip=${zipCode}`);
    } else {
      // Use the provided onSubmit handler with address components
      onSubmit(zipCode, addressComponents);
    }
  };

  return <AddressInput onAddressSelect={handleAddressSelected} />;
};

export default AddressSearch;
