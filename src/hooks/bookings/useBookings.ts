
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  time_slot: string;
  special_instructions: string | null;
  zip_code: string | null;
  service_id: string | null;
  payment_amount: number;
  payment_status: string;
  status: string;
  service?: {
    name: string;
    description: string;
    base_price: number;
  } | null;
};

// Fetch all bookings
export const fetchBookings = async (): Promise<Booking[]> => {
  try {
    console.log("Starting fetchBookings query");
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services (
          name,
          description,
          base_price
        )
      `)
      .order('booking_date', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
      return [];
    }

    console.log("Bookings query results:", data);
    return data || [];
  } catch (error) {
    console.error('Exception in fetchBookings:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
};

// Fetch a booking by ID
export const fetchBookingById = async (id?: string): Promise<Booking | null> => {
  if (!id) return null;
  
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services (
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
    console.error('Exception in fetchBookingById:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
};

// Fetch bookings by phone number
export const fetchBookingsByPhone = async (phone?: string): Promise<Booking[]> => {
  if (!phone) return [];
  
  console.log(`Fetching bookings for phone number: ${phone}`);
  
  try {
    const query = supabase
      .from('bookings')
      .select(`
        *,
        service:services (
          name,
          description,
          base_price
        )
      `)
      .eq('customer_phone', phone)
      .order('booking_date', { ascending: false });
    
    // Log the generated SQL query (in development only)
    console.log("Generated query:", query);
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bookings by phone:', error);
      toast.error('Failed to load your bookings');
      return [];
    }

    console.log(`Found ${data?.length || 0} bookings for phone ${phone}:`, data);
    
    // Log each booking's service info for debugging
    if (data && data.length > 0) {
      data.forEach(booking => {
        console.log(`Booking ${booking.id} service:`, booking.service);
      });
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception in fetchBookingsByPhone:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
};

// Hook to get all bookings
export const useBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: fetchBookings
  });
};

// Hook to get a specific booking by ID
export const useBookingDetail = (id?: string) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => fetchBookingById(id),
    enabled: !!id
  });
};

// Hook to get bookings by phone number
export const useBookingsByPhone = (phone?: string) => {
  return useQuery({
    queryKey: ['bookingsByPhone', phone],
    queryFn: () => fetchBookingsByPhone(phone),
    enabled: !!phone
  });
};
