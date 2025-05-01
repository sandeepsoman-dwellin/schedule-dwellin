
import { useState } from 'react';
import { toast } from "sonner";
import { BookingFormData, BookingData, createBooking } from '@/hooks/bookings/bookingApi';
import { Service } from '@/hooks/services/types';

export const useBookingProcess = (serviceId: string, service: Service | null, zipCode: string, fullAddress: string) => {
  const [formData, setFormData] = useState<BookingFormData | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  
  // Handle form submission
  const handleFormSubmit = (data: BookingFormData) => {
    setFormData(data);
    setShowPaymentModal(true);
  };
  
  // Handle payment processing
  const handlePaymentSuccess = async () => {
    if (!formData || !service) return;
    
    try {
      setIsPaymentProcessing(true);
      
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
        address: fullAddress,
        notes: formData.notes || ''
      };
      
      console.log("Sending booking data:", bookingData);
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
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  return {
    formData,
    showPaymentModal, 
    setShowPaymentModal,
    bookingComplete,
    bookingId,
    isPaymentProcessing,
    handleFormSubmit,
    handlePaymentSuccess
  };
};
