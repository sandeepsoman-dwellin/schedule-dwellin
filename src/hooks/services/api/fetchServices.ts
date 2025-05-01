
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ServiceBase } from "../types";
import { seedSampleData } from "./seedService";

// Helper function to fetch services
export const fetchServices = async (zipCode?: string): Promise<ServiceBase[]> => {
  // Build the query
  let query = supabase.from('services').select('*');
  
  // If zipCode is provided, filter by it or include services with null zip_code
  if (zipCode) {
    query = query.or(`zip_code.eq.${zipCode},zip_code.is.null`);
  }
  
  const { data: services, error } = await query.order('name');
  
  if (error) {
    console.error('Error fetching services:', error);
    toast.error('Failed to load services');
    throw error;
  }

  // If no services found, seed sample data
  if (!services || services.length === 0) {
    console.log('No services found, attempting to seed sample data...');
    return await seedSampleData();
  }

  return services;
};
