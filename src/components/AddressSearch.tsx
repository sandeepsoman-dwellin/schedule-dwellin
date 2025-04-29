
import React from "react";
import { useNavigate } from "react-router-dom";
import AddressInput from "@/components/AddressInput";

interface AddressSearchProps {
  onSubmit: (zipCode: string) => void;
  autoNavigate?: boolean;
}

const AddressSearch = ({ onSubmit, autoNavigate = false }: AddressSearchProps) => {
  const navigate = useNavigate();

  const handleAddressSelected = (_address: string, zipCode: string) => {
    if (autoNavigate) {
      // Directly navigate to services page with the zip code
      navigate(`/services?zip=${zipCode}`);
    } else {
      // Use the provided onSubmit handler
      onSubmit(zipCode);
    }
  };

  return <AddressInput onAddressSelect={handleAddressSelected} />;
};

export default AddressSearch;
