
import { useMemo } from 'react';
import { Booking } from '@/hooks/bookings/useBookings';

export const useFilteredBookings = (bookings: Booking[]) => {
  const filteredBookings = useMemo(() => {
    console.log('All bookings in useFilteredBookings:', bookings);
    return bookings;
  }, [bookings]);
  
  // Separate upcoming and past bookings
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Reset time part to compare dates only
  
  console.log('Current date for comparison:', currentDate);
  
  const upcomingBookings = useMemo(() => {
    const upcoming = filteredBookings.filter(booking => {
      const bookingDate = new Date(booking.booking_date);
      bookingDate.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison
      
      const isUpcoming = bookingDate >= currentDate;
      console.log(`Booking ${booking.id} date: ${bookingDate}, is upcoming: ${isUpcoming}, service: ${JSON.stringify(booking.service)}`);
      
      return isUpcoming;
    }).sort((a, b) => {
      // Sort by date (ascending)
      return new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime();
    });
    
    console.log('Upcoming bookings:', upcoming);
    return upcoming;
  }, [filteredBookings, currentDate]);
  
  const pastBookings = useMemo(() => {
    const past = filteredBookings.filter(booking => {
      const bookingDate = new Date(booking.booking_date);
      bookingDate.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison
      
      return bookingDate < currentDate;
    }).sort((a, b) => {
      // Sort by date (descending)
      return new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime();
    });
    
    console.log('Past bookings:', past);
    return past;
  }, [filteredBookings, currentDate]);
  
  return {
    filteredBookings,
    upcomingBookings,
    pastBookings
  };
};
