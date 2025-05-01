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
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);
    
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

export const cancelBooking = async (bookingId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);
    
    if (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel appointment');
      return false;
    }
    
    console.log('Booking cancelled successfully:', data);
    toast.success('Appointment cancelled successfully');
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
    
    // In a real app, this would fetch from time_slot_availability table
    // For now, returning a static list of time slots
    const defaultTimeSlots = [
      '9:00 AM - 11:00 AM',
      '11:00 AM - 1:00 PM',
      '1:00 PM - 3:00 PM',
      '3:00 PM - 5:00 PM'
    ];
    
    return defaultTimeSlots;
  } catch (error) {
    console.error('Exception in getAvailableTimeSlots:', error);
    return [];
  }
};
