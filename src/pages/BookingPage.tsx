
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useService } from '@/hooks/services';
import BookingForm from '@/components/booking/BookingForm';
import OrderSummary from '@/components/booking/OrderSummary';
import PaymentModal from '@/components/booking/PaymentModal';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import LoadingState from '@/components/booking/LoadingState';
import ErrorState from '@/components/booking/ErrorState';
import AddressDialog from '@/components/booking/AddressDialog';
import { BookingFormData, BookingData, createBooking } from '@/hooks/bookings/bookingApi';
import { toast } from "sonner";

const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const serviceId = searchParams.get('serviceId') || '';
  
  const { data: service, isLoading, error } = useService(serviceId);
  const [formData, setFormData] = useState<BookingFormData | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState<string>('');
  const [fullAddress, setFullAddress] = useState<string>('');
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  
  // Check for address data from sessionStorage
  useEffect(() => {
    // First check sessionStorage
    const storedZipCode = sessionStorage.getItem('zipCode');
    const storedAddress = sessionStorage.getItem('customerAddress');
    
    // Then check URL parameters or localStorage as fallback
    const urlZipCode = searchParams.get('zipCode');
    const localZipCode = localStorage.getItem('zipCode');
    const localAddress = localStorage.getItem('customerAddress');
    
    if (storedZipCode && storedAddress) {
      // Use sessionStorage values (highest priority)
      setZipCode(storedZipCode);
      setFullAddress(storedAddress);
    } else if (urlZipCode) {
      // Use URL zipCode, potentially showing dialog for full address
      setZipCode(urlZipCode);
      
      // If we find address in localStorage, use it and save to sessionStorage
      if (localAddress) {
        setFullAddress(localAddress);
        sessionStorage.setItem('customerAddress', localAddress);
        sessionStorage.setItem('zipCode', urlZipCode);
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
    } else {
      // No address information available, show dialog
      setShowAddressDialog(true);
    }
  }, [searchParams]);
  
  // Handle address selection from dialog
  const handleAddressSelect = (address: string, newZipCode: string) => {
    setFullAddress(address);
    setZipCode(newZipCode);
    
    // Save to both localStorage and sessionStorage for future use
    localStorage.setItem('customerAddress', address);
    localStorage.setItem('zipCode', newZipCode);
    sessionStorage.setItem('customerAddress', address);
    sessionStorage.setItem('zipCode', newZipCode);
  };
  
  // Handle form submission
  const handleFormSubmit = (data: BookingFormData) => {
    setFormData(data);
    setShowPaymentModal(true);
  };
  
  // Handle payment processing
  const handlePaymentSuccess = async (paymentMethod: string) => {
    if (!formData || !service) return;
    
    try {
      // Create booking data with all required fields
      const bookingData: BookingData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        timeSlot: formData.timeSlot,
        serviceId: serviceId,
        paymentAmount: service.base_price,
        zipCode: zipCode,
        address: fullAddress, // Include the full address
        notes: formData.notes || ''
      };
      
      const newBookingId = await createBooking(bookingData);
      
      if (newBookingId) {
        setBookingId(newBookingId);
        setBookingComplete(true);
        toast.success("Booking confirmed successfully!");
        setShowPaymentModal(false);
      } else {
        toast.error("Failed to create booking. Please try again.");
      }
    } catch (error) {
      console.error("Error processing booking:", error);
      toast.error("Payment processing error. Please try again.");
    }
  };
  
  const handleReturnToServices = () => {
    navigate('/services');
  };
  
  // Show loading state
  if (isLoading) return <LoadingState />;
  
  // Show error state if service not found
  if (error || !service) return <ErrorState />;
  
  // Show confirmation screen after successful booking
  if (bookingComplete && bookingId) {
    return (
      <BookingConfirmation 
        bookingId={bookingId}
        service={service}
      />
    );
  }
  
  // Main booking form page
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Schedule Service</h1>
      
      {/* Show address for confirmation */}
      {fullAddress && (
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
      )}
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left column: Booking form */}
        <div className="md:col-span-2">
          <BookingForm 
            onSubmit={handleFormSubmit} 
            isPaymentProcessing={false} 
          />
        </div>
        
        {/* Right column: Order summary */}
        <div>
          <OrderSummary
            service={service}
            onPayClick={() => {
              // Form validation is handled within BookingForm component
              const bookingForm = document.querySelector('form');
              if (bookingForm) {
                bookingForm.dispatchEvent(
                  new Event('submit', { cancelable: true, bubbles: true })
                );
              }
            }}
            isPaymentProcessing={false}
          />
        </div>
      </div>
      
      {/* Address dialog */}
      <AddressDialog
        isOpen={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        onAddressSelect={handleAddressSelect}
      />
      
      {/* Payment modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onPaymentComplete={() => handlePaymentSuccess('credit-card')}
      />
    </div>
  );
};

export default BookingPage;
