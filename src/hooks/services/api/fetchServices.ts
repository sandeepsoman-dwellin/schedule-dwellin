
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ServiceBase } from "../types";
import { seedSampleData } from "./seedService";
import { validateZipCode } from "@/hooks/useGooglePlaces";

// Enhanced helper function to fetch services with better ZIP code handling
export const fetchServices = async (zipCode?: string): Promise<ServiceBase[]> => {
  // Always try to get ZIP code from session storage first if not provided
  const sessionZipCode = sessionStorage.getItem("zipCode");
  
  // Use provided zipCode as priority, then fallback to session storage
  let zipToUse = zipCode && zipCode.trim() !== '' 
    ? zipCode 
    : sessionZipCode && sessionZipCode.trim() !== ''
      ? sessionZipCode
      : '';
  
  // Validate ZIP code format
  if (zipToUse && !validateZipCode(zipToUse)) {
    console.warn(`Invalid ZIP code format: "${zipToUse}". Fetching all services instead.`);
    zipToUse = '';
  }
  
  // CRITICAL: Log ZIP code information for debugging
  console.log(`=== FETCH SERVICES ZIP CODE INFO ===`);
  console.log(`Provided ZIP: "${zipCode}"`);
  console.log(`Session ZIP: "${sessionZipCode}"`);
  console.log(`ZIP being used: "${zipToUse}"`);
  console.log(`ZIP validation result: ${zipToUse ? validateZipCode(zipToUse) : 'N/A'}`);
  
  // Build the optimized query
  let query = supabase.from('services').select('*');
  
  // Filter by ZIP code if available and valid
  if (zipToUse && zipToUse.trim() !== '') {
    console.log(`Filtering services by ZIP code: ${zipToUse}`);
    // Optimized query: exact match OR null (for services available everywhere)
    query = query.or(`zip_code.eq.${zipToUse},zip_code.is.null`);
  } else {
    console.log('No valid ZIP code provided, fetching all services');
  }
  
  const { data: services, error } = await query.order('name');
  
  if (error) {
    console.error('Error fetching services:', error);
    toast.error('Failed to load services');
    throw error;
  }

  console.log(`Found ${services?.length || 0} services for ZIP code: ${zipToUse}`);

  // If no services found, seed sample data only if we have a valid ZIP code
  if (!services || services.length === 0) {
    if (zipToUse) {
      console.log(`No services found for ZIP code ${zipToUse}. User should be redirected to waitlist.`);
      return []; // Return empty array to trigger waitlist redirect
    } else {
      console.log('No services found, attempting to seed sample data...');
      return await seedSampleData();
    }
  }

  return services;
};
