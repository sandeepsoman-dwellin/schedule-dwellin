
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
  address?: string;  // Ensure address is in the interface
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

export const rescheduleBooking = async (
  bookingId: string, 
  newDate: Date, 
  newTimeSlot: string
): Promise<boolean> => {
  try {
    const formattedDate = newDate.toISOString().split('T')[0];
    
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
      console.error('Error rescheduling booking:', error);
      toast.error('Failed to reschedule appointment');
      return false;
    }
    
    console.log('Booking rescheduled successfully:', data);
    toast.success('Appointment rescheduled successfully');
    return true;
  } catch (error) {
    console.error('Exception in rescheduleBooking:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
};

export const cancelBooking = async (bookingId: string, cancellationReason: string): Promise<boolean> => {
  try {
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
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel appointment');
      return false;
    }
    
    console.log('Booking cancelled successfully:', data);
    return true;
  } catch (error) {
    console.error('Exception in cancelBooking:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
};

export const getAvailableTimeSlots = async (date: Date): Promise<string[]> => {
  try {
    const formattedDate = date.toISOString().split('T')[0];
    
    // Get booked time slots for the date
    const { data: bookedSlots, error: bookedError } = await supabase
      .from('bookings')
      .select('time_slot')
      .eq('booking_date', formattedDate)
      .in('status', ['confirmed', 'pending']);
    
    if (bookedError) {
      console.error('Error fetching booked time slots:', bookedError);
    }
    
    // Define all available time slots
    const allTimeSlots = [
      '9:00 AM - 11:00 AM',
      '11:00 AM - 1:00 PM',
      '1:00 PM - 3:00 PM',
      '3:00 PM - 5:00 PM'
    ];
    
    // Filter out booked slots
    const bookedTimeSlots = bookedSlots ? bookedSlots.map(slot => slot.time_slot) : [];
    const availableSlots = allTimeSlots.filter(slot => !bookedTimeSlots.includes(slot));
    
    console.log('Available time slots:', availableSlots);
    return availableSlots.length > 0 ? availableSlots : allTimeSlots;
  } catch (error) {
    console.error('Exception in getAvailableTimeSlots:', error);
    return [
      '9:00 AM - 11:00 AM',
      '11:00 AM - 1:00 PM',
      '1:00 PM - 3:00 PM',
      '3:00 PM - 5:00 PM'
    ];
  }
};
