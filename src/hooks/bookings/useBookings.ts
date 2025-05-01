
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
      .order('booking_date', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
      return [];
    }

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
    console.error('Exception in fetchBookingById:', error);
    toast.error('An unexpected error occurred');
    return null;
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
