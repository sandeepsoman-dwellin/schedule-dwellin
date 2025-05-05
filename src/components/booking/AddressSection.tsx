
import React from 'react';
import { AddressComponents } from '@/hooks/useGooglePlaces';

interface AddressSectionProps {
  fullAddress: string;
  setShowAddressDialog: (show: boolean) => void;
  addressComponents?: AddressComponents | null;
}

const AddressSection: React.FC<AddressSectionProps> = ({ 
  fullAddress, 
  setShowAddressDialog,
  addressComponents
}) => {
  if (!fullAddress) return null;
  
  // Format the address in a standardized way if components are available
  const formatStandardAddress = () => {
    if (!addressComponents) return fullAddress;
    
    const street = [addressComponents.street_number, addressComponents.route]
      .filter(Boolean)
      .join(' ');
    
    const cityStateZip = [
      addressComponents.locality,
      addressComponents.administrative_area_level_1,
      addressComponents.postal_code
    ].filter(Boolean).join(', ');
    
    if (street && cityStateZip) {
      return `${street}, ${cityStateZip}`;
    }
    
    return fullAddress;
  };
  
  const formattedAddress = formatStandardAddress();
  
  return (
    <div className="bg-gray-50 rounded-md p-4 mb-6 border border-gray-200">
      <h3 className="text-lg font-medium mb-2">Service Address</h3>
      <p className="text-gray-700">{formattedAddress}</p>
      <button 
        onClick={() => setShowAddressDialog(true)}
        className="text-dwellin-sky text-sm font-medium mt-2 hover:text-dwellin-navy"
      >
        Change Address
      </button>
    </div>
  );
};

export default AddressSection;
