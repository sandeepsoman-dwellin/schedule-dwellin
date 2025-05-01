
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

export type BookingData = BookingFormData & {
  serviceId: string;
  paymentAmount: number;
};

// Create a new booking in the database
export const createBooking = async (bookingData: BookingData): Promise<string | null> => {
  try {
    // Format the date as ISO string for database storage
    const formattedDate = bookingData.date.toISOString().split('T')[0];
    
    // Prepare the booking data for inserting into the database
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        customer_name: bookingData.name,
        customer_email: bookingData.email,
        customer_phone: bookingData.phone,
        booking_date: formattedDate,
        time_slot: bookingData.timeSlot,
        special_instructions: bookingData.notes,
        zip_code: bookingData.zipCode,
        service_id: bookingData.serviceId,
        payment_amount: bookingData.paymentAmount,
        payment_status: 'authorized',  // Since we're just authorizing the payment
        status: 'confirmed'            // Initial booking status
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
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
