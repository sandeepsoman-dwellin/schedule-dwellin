
import React from 'react';
import BookingForm from '@/components/booking/BookingForm';
import OrderSummary from '@/components/booking/OrderSummary';
import { Service } from '@/hooks/services/types';
import { BookingFormData } from '@/hooks/bookings/bookingApi';

interface BookingLayoutProps {
  service: Service;
  onFormSubmit: (data: BookingFormData) => void;
  isPaymentProcessing: boolean;
}

const BookingLayout: React.FC<BookingLayoutProps> = ({ 
  service, 
  onFormSubmit, 
  isPaymentProcessing 
}) => {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Left column: Booking form */}
      <div className="md:col-span-2">
        <BookingForm 
          onSubmit={onFormSubmit} 
          isPaymentProcessing={isPaymentProcessing} 
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
          isPaymentProcessing={isPaymentProcessing}
        />
      </div>
    </div>
  );
};

export default BookingLayout;
