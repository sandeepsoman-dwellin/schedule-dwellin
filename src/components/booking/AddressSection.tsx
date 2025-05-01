
import React from 'react';
import AddressDialog from '@/components/booking/AddressDialog';

interface AddressSectionProps {
  fullAddress: string;
  setShowAddressDialog: (show: boolean) => void;
}

const AddressSection: React.FC<AddressSectionProps> = ({ 
  fullAddress, 
  setShowAddressDialog 
}) => {
  if (!fullAddress) return null;
  
  return (
    <div className="bg-gray-50 rounded-md p-4 mb-6 border border-gray-200">
      <h3 className="text-lg font-medium mb-2">Service Address</h3>
      <p className="text-gray-700">{fullAddress}</p>
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
