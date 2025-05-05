
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AddressComponents } from '@/hooks/useGooglePlaces';

export interface AddressData {
  fullAddress: string;
  zipCode: string;
  components?: AddressComponents;
}

export const useAddressManagement = () => {
  const [searchParams] = useSearchParams();
  const [zipCode, setZipCode] = useState<string>('');
  const [fullAddress, setFullAddress] = useState<string>('');
  const [addressComponents, setAddressComponents] = useState<AddressComponents | null>(null);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  
  // Check for address data from sessionStorage
  useEffect(() => {
    // First check sessionStorage
    const storedZipCode = sessionStorage.getItem('zipCode');
    const storedAddress = sessionStorage.getItem('customerAddress');
    const storedComponents = sessionStorage.getItem('addressComponents');
    
    console.log("Retrieved from sessionStorage - zipCode:", storedZipCode, "address:", storedAddress);
    
    // Then check URL parameters or localStorage as fallback
    const urlZipCode = searchParams.get('zipCode');
    const localZipCode = localStorage.getItem('zipCode');
    const localAddress = localStorage.getItem('customerAddress');
    const localComponents = localStorage.getItem('addressComponents');
    
    let parsedComponents: AddressComponents | null = null;
    
    if (storedComponents) {
      try {
        parsedComponents = JSON.parse(storedComponents);
      } catch (e) {
        console.error("Error parsing stored address components:", e);
      }
    } else if (localComponents) {
      try {
        parsedComponents = JSON.parse(localComponents);
      } catch (e) {
        console.error("Error parsing local address components:", e);
      }
    }
    
    if (storedZipCode && storedAddress) {
      // Use sessionStorage values (highest priority)
      setZipCode(storedZipCode);
      setFullAddress(storedAddress);
      if (parsedComponents) setAddressComponents(parsedComponents);
      console.log("Using session storage address:", storedAddress);
    } else if (urlZipCode) {
      // Use URL zipCode, potentially showing dialog for full address
      setZipCode(urlZipCode);
      
      // If we find address in localStorage, use it and save to sessionStorage
      if (localAddress) {
        setFullAddress(localAddress);
        sessionStorage.setItem('customerAddress', localAddress);
        sessionStorage.setItem('zipCode', urlZipCode);
        
        if (localComponents) {
          sessionStorage.setItem('addressComponents', localComponents);
          try {
            setAddressComponents(JSON.parse(localComponents));
          } catch (e) {
            console.error("Error parsing local address components:", e);
          }
        }
        
        console.log("Using localStorage address:", localAddress);
      } else {
        // Need to collect full address
        setShowAddressDialog(true);
      }
    } else if (localZipCode && localAddress) {
      // Use localStorage values as last resort
      setZipCode(localZipCode);
      setFullAddress(localAddress);
      if (parsedComponents) setAddressComponents(parsedComponents);
      // Save to sessionStorage for future use
      sessionStorage.setItem('customerAddress', localAddress);
      sessionStorage.setItem('zipCode', localZipCode);
      if (localComponents) {
        sessionStorage.setItem('addressComponents', localComponents);
      }
      console.log("Using localStorage fallback address:", localAddress);
    } else {
      // No address information available, show dialog
      setShowAddressDialog(true);
    }
  }, [searchParams]);

  const handleAddressSelect = (address: string, newZipCode: string, components?: AddressComponents) => {
    console.log("Address selected:", address, "ZIP:", newZipCode, "Components:", components);
    setFullAddress(address);
    setZipCode(newZipCode);
    if (components) setAddressComponents(components);
    
    // Save to both localStorage and sessionStorage for future use
    localStorage.setItem('customerAddress', address);
    localStorage.setItem('zipCode', newZipCode);
    sessionStorage.setItem('customerAddress', address);
    sessionStorage.setItem('zipCode', newZipCode);
    
    if (components) {
      const componentsString = JSON.stringify(components);
      localStorage.setItem('addressComponents', componentsString);
      sessionStorage.setItem('addressComponents', componentsString);
    }
  };

  return {
    zipCode,
    fullAddress,
    addressComponents,
    showAddressDialog,
    setShowAddressDialog,
    handleAddressSelect
  };
};
