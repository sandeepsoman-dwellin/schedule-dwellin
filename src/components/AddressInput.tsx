
import React, { useRef } from "react";
import { useAddressForm } from "@/hooks/useAddressForm";
import { useAddressAutocomplete } from "@/hooks/useAddressAutocomplete";
import AddressInputForm from "@/components/address/AddressInputForm";
import { AddressComponents } from "@/hooks/useGooglePlaces";

interface AddressInputProps {
  onAddressSelect: (address: string, zipCode: string, addressComponents?: AddressComponents) => void;
}

const AddressInput = ({ onAddressSelect }: AddressInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Use our custom hooks to manage address form state and autocomplete
  const {
    address,
    setAddress,
    zipCode,
    setZipCode,
    addressComponents,
    setAddressComponents,
    isLoading,
    setIsLoading,
    validationError,
    handleAddressChange,
    handleAddressSelection,
    handleSubmit
  } = useAddressForm({ onAddressSelect });
  
  // Always call useAddressAutocomplete in the same order
  const { placesLoaded, quotaExceeded, containerRef } = useAddressAutocomplete({
    inputRef,
    setAddress,
    setZipCode,
    setAddressComponents,
    handleAddressSelection
  });

  return (
    <AddressInputForm
      address={address}
      handleAddressChange={handleAddressChange}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      inputRef={inputRef}
      placesLoaded={placesLoaded}
      quotaExceeded={quotaExceeded}
      containerRef={containerRef}
      validationError={validationError}
    />
  );
};

export default AddressInput;
