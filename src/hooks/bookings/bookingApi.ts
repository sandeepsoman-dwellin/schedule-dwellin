
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define booking types
export type BookingFormData = {
  name: string;
  email: string;
  phone: string;
  date: Date;
  timeSlot: string;
  notes?: string;
  zipCode?: string;
};

export interface BookingData {
  name: string;
  email: string;
  phone: string;
  date: Date;
  timeSlot: string;
  serviceId: string;
  paymentAmount: number;
  zipCode: string;
  address?: string;
  notes?: string;
}

// Create a new booking in the database
export const createBooking = async (bookingData: BookingData): Promise<string | null> => {
  try {
    // Format the date as ISO string for database storage
    const formattedDate = bookingData.date.toISOString().split('T')[0];
    
    console.log("Creating booking with data:", {
      customer_name: bookingData.name,
      customer_email: bookingData.email,
      customer_phone: bookingData.phone,
      booking_date: formattedDate,
      time_slot: bookingData.timeSlot,
      special_instructions: bookingData.notes || null,
      zip_code: bookingData.zipCode,
      service_id: bookingData.serviceId,
      payment_amount: bookingData.paymentAmount,
      address: bookingData.address || null
    });
    
    // Ensure address is provided and valid
    if (!bookingData.address) {
      console.warn("No address provided for booking");
    }
    
    // Prepare the booking data for inserting into the database
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        customer_name: bookingData.name,
        customer_email: bookingData.email,
        customer_phone: bookingData.phone,
        booking_date: formattedDate,
        time_slot: bookingData.timeSlot,
        special_instructions: bookingData.notes || null,
        zip_code: bookingData.zipCode,
        service_id: bookingData.serviceId,
        payment_amount: bookingData.paymentAmount,
        payment_status: 'authorized',  // Since we're just authorizing the payment
        status: 'confirmed',           // Initial booking status
        address: bookingData.address || null  // Include address field if provided
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking: ' + error.message);
      return null;
    }

    console.log('Booking created successfully:', data);
    return data.id;
  } catch (error) {
    console.error('Exception in createBooking:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
};

// Get a booking by its ID
export const getBookingById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services (
          name,
          description,
          base_price
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to fetch booking details');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in getBookingById:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
};

// Define the consistent time slots to use across the application
export const TIME_SLOTS = [
  '9:00 AM - 11:00 AM',
  '11:00 AM - 1:00 PM',
  '1:00 PM - 3:00 PM',
  '3:00 PM - 5:00 PM'
];

export const rescheduleBooking = async (
  bookingId: string, 
  newDate: Date, 
  newTimeSlot: string
): Promise<boolean> => {
  try {
    console.log('Starting rescheduleBooking with:', { bookingId, newDate, newTimeSlot });
    
    if (!bookingId) {
      console.error('Error: bookingId is undefined or null');
      toast.error('Cannot reschedule: Missing booking ID');
      return false;
    }
    
    // Format date properly for database
    const formattedDate = newDate.toISOString().split('T')[0];
    console.log('Formatted date for database:', formattedDate);
    
    // Log the actual update operation we're about to perform
    console.log('Executing Supabase update with:', {
      table: 'bookings',
      id: bookingId,
      updates: {
        booking_date: formattedDate,
        time_slot: newTimeSlot,
        status: 'pending',
        updated_at: new Date().toISOString()
      }
    });
    
    const { data, error } = await supabase
      .from('bookings')
      .update({
        booking_date: formattedDate,
        time_slot: newTimeSlot,
        status: 'pending', // Set status to pending for rescheduled bookings
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select();
    
    if (error) {
      console.error('Supabase error rescheduling booking:', error);
      toast.error(`Failed to reschedule appointment: ${error.message}`);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned after update, but no error was thrown');
      toast.error('Failed to update appointment - no matching booking found');
      return false;
    }
    
    console.log('Booking rescheduled successfully, returned data:', data);
    toast.success('Appointment rescheduled successfully');
    return true;
  } catch (error) {
    console.error('Exception in rescheduleBooking:', error);
    toast.error('An unexpected error occurred while rescheduling');
    return false;
  }
};

export const cancelBooking = async (bookingId: string, cancellationReason: string): Promise<boolean> => {
  try {
    console.log('Starting cancelBooking with:', { bookingId, cancellationReason });
    
    if (!bookingId) {
      console.error('Error: bookingId is undefined or null');
      toast.error('Cannot cancel: Missing booking ID');
      return false;
    }
    
    if (!cancellationReason || cancellationReason.trim() === '') {
      console.error('Error: cancellationReason is empty');
      toast.error('Please provide a reason for cancellation');
      return false;
    }
    
    // Log the actual update operation we're about to perform
    console.log('Executing Supabase update with:', {
      table: 'bookings',
      id: bookingId,
      updates: {
        status: 'cancelled',
        cancellation_reason: cancellationReason,
        updated_at: new Date().toISOString()
      }
    });
    
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: cancellationReason,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select();
    
    if (error) {
      console.error('Supabase error cancelling booking:', error);
      toast.error(`Failed to cancel appointment: ${error.message}`);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned after cancel update, but no error was thrown');
      toast.error('Failed to cancel appointment - no matching booking found');
      return false;
    }
    
    console.log('Booking cancelled successfully, returned data:', data);
    toast.success('Your appointment has been cancelled and the credit card authorization has been dropped.');
    return true;
  } catch (error) {
    console.error('Exception in cancelBooking:', error);
    toast.error('An unexpected error occurred while cancelling');
    return false;
  }
};

export const getAvailableTimeSlots = async (date: Date): Promise<string[]> => {
  try {
    const formattedDate = date.toISOString().split('T')[0];
    console.log('Getting available time slots for date:', formattedDate);
    
    // Get booked time slots for the date
    const { data: bookedSlots, error: bookedError } = await supabase
      .from('bookings')
      .select('time_slot')
      .eq('booking_date', formattedDate)
      .in('status', ['confirmed', 'pending']);
    
    if (bookedError) {
      console.error('Error fetching booked time slots:', bookedError);
    }
    
    // Use the consistent time slots
    const allTimeSlots = TIME_SLOTS;
    
    // Filter out booked slots
    const bookedTimeSlots = bookedSlots ? bookedSlots.map(slot => slot.time_slot) : [];
    const availableSlots = allTimeSlots.filter(slot => !bookedTimeSlots.includes(slot));
    
    console.log('Available time slots:', availableSlots, 'Booked slots:', bookedTimeSlots);
    return availableSlots.length > 0 ? availableSlots : allTimeSlots;
  } catch (error) {
    console.error('Exception in getAvailableTimeSlots:', error);
    return TIME_SLOTS;
  }
};
