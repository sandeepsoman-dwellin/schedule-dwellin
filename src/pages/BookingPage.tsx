
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/sonner';
import { fetchServiceById } from '@/hooks/services/serviceApi';
import { createBooking } from '@/hooks/bookings/bookingApi';
import BookingForm, { BookingFormValues } from '@/components/booking/BookingForm';
import OrderSummary from '@/components/booking/OrderSummary';
import PaymentModal from '@/components/booking/PaymentModal';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import LoadingState from '@/components/booking/LoadingState';
import ErrorState from '@/components/booking/ErrorState';

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('service') || '';
  const zipCode = searchParams.get('zip') || '';
  
  // Use React Query to fetch the service data
  const { data: service, isLoading: serviceLoading, error: serviceError } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => fetchServiceById(serviceId),
    enabled: !!serviceId,
  });
  
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<BookingFormValues | null>(null);

  // Handle form submission
  const onSubmit = (values: BookingFormValues) => {
    console.log("Form values:", values);
    setFormValues(values);
    setIsPaymentModalOpen(true);
  };

  // Handle payment completion
  const handlePaymentCompletion = async () => {
    if (!service || !formValues) return;
    
    setIsPaymentModalOpen(false);
    setIsPaymentProcessing(true);
    
    try {
      // Save booking to database
      const createdBookingId = await createBooking({
        ...formValues,
        serviceId: service.id,
        paymentAmount: service.base_price,
        zipCode
      });
      
      if (createdBookingId) {
        setBookingId(createdBookingId);
        setIsPaymentProcessing(false);
        setShowThankYou(true);
        
        toast.success("Payment successful!", {
          description: "Your booking has been confirmed.",
        });
      } else {
        setIsPaymentProcessing(false);
        toast.error("Failed to complete booking", {
          description: "Please try again or contact support.",
        });
      }
    } catch (error) {
      console.error("Error completing booking:", error);
      setIsPaymentProcessing(false);
      toast.error("Failed to complete booking", {
        description: "Please try again or contact support.",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Loading State */}
          {serviceLoading && (
            <LoadingState />
          )}
          
          {/* Error State */}
          {(serviceError || !service) && !serviceLoading && (
            <ErrorState />
          )}
          
          {/* Thank You/Confirmation State */}
          {showThankYou && service && (
            <BookingConfirmation service={service} bookingId={bookingId} />
          )}
          
          {/* Booking Form State */}
          {service && !serviceLoading && !showThankYou && (
            <>
              <Link to={`/services/${service.slug || service.id}?zip=${zipCode}`} className="text-dwellin-navy hover:underline mb-4 inline-flex items-center">
                ← Back to Service Details
              </Link>
              
              <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-2">Book Your {service.name}</h1>
              <p className="text-gray-600 mb-8">{service.description}</p>
              
              <div className="grid md:grid-cols-3 gap-8">
                {/* Booking Form - Takes 2/3 of the width on desktop */}
                <div className="md:col-span-2">
                  <BookingForm 
                    onSubmit={onSubmit} 
                    isPaymentProcessing={isPaymentProcessing}
                  />
                </div>
                
                {/* Order Summary - Takes 1/3 of the width on desktop */}
                <div>
                  <OrderSummary 
                    service={service}
                    onPayClick={() => formValues ? setIsPaymentModalOpen(true) : null}
                    isPaymentProcessing={isPaymentProcessing}
                  />
                </div>
              </div>
              
              {/* Payment Modal */}
              <PaymentModal 
                isOpen={isPaymentModalOpen} 
                onOpenChange={setIsPaymentModalOpen} 
                onPaymentComplete={handlePaymentCompletion}
              />
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BookingPage;
