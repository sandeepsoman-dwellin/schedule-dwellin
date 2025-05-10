
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ServiceBase } from "../types";
import { seedSampleData } from "./seedService";

// Helper function to fetch services
export const fetchServices = async (zipCode?: string): Promise<ServiceBase[]> => {
  // Always try to get ZIP code from session storage first if not provided
  const sessionZipCode = sessionStorage.getItem("zipCode");
  
  // Use provided zipCode as priority, then fallback to session storage
  const zipToUse = zipCode && zipCode.trim() !== '' 
    ? zipCode 
    : sessionZipCode && sessionZipCode.trim() !== ''
      ? sessionZipCode
      : '';
  
  // CRITICAL: Log ZIP code information for debugging
  console.log(`=== FETCH SERVICES ZIP CODE INFO ===`);
  console.log(`Provided ZIP: "${zipCode}"`);
  console.log(`Session ZIP: "${sessionZipCode}"`);
  console.log(`ZIP being used: "${zipToUse}"`);
  
  // Build the query
  let query = supabase.from('services').select('*');
  
  // Filter by ZIP code if available
  if (zipToUse && zipToUse.trim() !== '') {
    console.log(`Filtering services by ZIP code: ${zipToUse}`);
    query = query.or(`zip_code.eq.${zipToUse},zip_code.is.null`);
  } else {
    console.log('No ZIP code provided, fetching all services');
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
