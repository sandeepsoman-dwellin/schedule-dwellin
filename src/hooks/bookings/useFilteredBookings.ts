
import { useMemo } from 'react';
import { Booking } from '@/hooks/bookings/useBookings';

export const useFilteredBookings = (bookings: Booking[], verifiedPhone: string | null) => {
  const filteredBookings = useMemo(() => {
    // Filter bookings by the verified phone number if it exists
    return verifiedPhone 
      ? bookings.filter(booking => booking.customer_phone === verifiedPhone)
      : bookings;
  }, [bookings, verifiedPhone]);
  
  // Separate upcoming and past bookings
  const currentDate = new Date();
  
  const upcomingBookings = useMemo(() => {
    return filteredBookings.filter(booking => {
      const bookingDate = new Date(booking.booking_date);
      return bookingDate >= currentDate || (
        bookingDate.getDate() === currentDate.getDate() && 
        bookingDate.getMonth() === currentDate.getMonth() && 
        bookingDate.getFullYear() === currentDate.getFullYear()
      );
    });
  }, [filteredBookings, currentDate]);
  
  const pastBookings = useMemo(() => {
    return filteredBookings.filter(booking => {
      const bookingDate = new Date(booking.booking_date);
      return bookingDate < currentDate && !(
        bookingDate.getDate() === currentDate.getDate() && 
        bookingDate.getMonth() === currentDate.getMonth() && 
        bookingDate.getFullYear() === currentDate.getFullYear()
      );
    });
  }, [filteredBookings, currentDate]);
  
  return {
    filteredBookings,
    upcomingBookings,
    pastBookings
  };
};
