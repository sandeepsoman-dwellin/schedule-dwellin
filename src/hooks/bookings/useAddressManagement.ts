
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useAddressManagement = () => {
  const [searchParams] = useSearchParams();
  const [zipCode, setZipCode] = useState<string>('');
  const [fullAddress, setFullAddress] = useState<string>('');
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  
  // Check for address data from sessionStorage
  useEffect(() => {
    // First check sessionStorage
    const storedZipCode = sessionStorage.getItem('zipCode');
    const storedAddress = sessionStorage.getItem('customerAddress');
    
    console.log("Retrieved from sessionStorage - zipCode:", storedZipCode, "address:", storedAddress);
    
    // Then check URL parameters or localStorage as fallback
    const urlZipCode = searchParams.get('zipCode');
    const localZipCode = localStorage.getItem('zipCode');
    const localAddress = localStorage.getItem('customerAddress');
    
    if (storedZipCode && storedAddress) {
      // Use sessionStorage values (highest priority)
      setZipCode(storedZipCode);
      setFullAddress(storedAddress);
      console.log("Using session storage address:", storedAddress);
    } else if (urlZipCode) {
      // Use URL zipCode, potentially showing dialog for full address
      setZipCode(urlZipCode);
      
      // If we find address in localStorage, use it and save to sessionStorage
      if (localAddress) {
        setFullAddress(localAddress);
        sessionStorage.setItem('customerAddress', localAddress);
        sessionStorage.setItem('zipCode', urlZipCode);
        console.log("Using localStorage address:", localAddress);
      } else {
        // Need to collect full address
        setShowAddressDialog(true);
      }
    } else if (localZipCode && localAddress) {
      // Use localStorage values as last resort
      setZipCode(localZipCode);
      setFullAddress(localAddress);
      // Save to sessionStorage for future use
      sessionStorage.setItem('customerAddress', localAddress);
      sessionStorage.setItem('zipCode', localZipCode);
      console.log("Using localStorage fallback address:", localAddress);
    } else {
      // No address information available, show dialog
      setShowAddressDialog(true);
    }
  }, [searchParams]);

  const handleAddressSelect = (address: string, newZipCode: string) => {
    console.log("Address selected:", address, "ZIP:", newZipCode);
    setFullAddress(address);
    setZipCode(newZipCode);
    
    // Save to both localStorage and sessionStorage for future use
    localStorage.setItem('customerAddress', address);
    localStorage.setItem('zipCode', newZipCode);
    sessionStorage.setItem('customerAddress', address);
    sessionStorage.setItem('zipCode', newZipCode);
  };

  return {
    zipCode,
    fullAddress,
    showAddressDialog,
    setShowAddressDialog,
    handleAddressSelect
  };
};
