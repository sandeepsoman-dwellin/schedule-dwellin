
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useService } from '@/hooks/services';
import BookingLayout from '@/components/booking/BookingLayout';
import PaymentModal from '@/components/booking/PaymentModal';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import LoadingState from '@/components/booking/LoadingState';
import ErrorState from '@/components/booking/ErrorState';
import AddressDialog from '@/components/booking/AddressDialog';
import AddressSection from '@/components/booking/AddressSection';
import { useAddressManagement } from '@/hooks/bookings/useAddressManagement';
import { useBookingProcess } from '@/hooks/bookings/useBookingProcess';

const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const serviceId = searchParams.get('serviceId') || '';
  
  const { data: service, isLoading, error } = useService(serviceId);
  
  // Use our custom hooks to manage address and booking process
  const {
    zipCode,
    fullAddress,
    showAddressDialog,
    setShowAddressDialog,
    handleAddressSelect
  } = useAddressManagement();
  
  const {
    formData,
    showPaymentModal,
    setShowPaymentModal,
    bookingComplete,
    bookingId,
    isPaymentProcessing,
    handleFormSubmit,
    handlePaymentSuccess
  } = useBookingProcess(serviceId, service, zipCode, fullAddress);
  
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
      <AddressSection 
        fullAddress={fullAddress}
        setShowAddressDialog={setShowAddressDialog}
      />
      
      <BookingLayout 
        service={service}
        onFormSubmit={handleFormSubmit}
        isPaymentProcessing={isPaymentProcessing}
      />
      
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
        onPaymentComplete={handlePaymentSuccess}
      />
    </div>
  );
};

export default BookingPage;
