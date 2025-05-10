import { useQuery } from "@tanstack/react-query";
import { Service } from "./types";
import { fetchServices, fetchServiceDetails, fetchServiceById, seedSampleData } from "./api";

export const useServices = (zipCode?: string) => {
  // Always prioritize the provided zipCode but check session storage as fallback
  const sessionZipCode = sessionStorage.getItem("zipCode") || "";
  const effectiveZipCode = zipCode || sessionZipCode || "";
  
  // Add more detailed logging to track ZIP code flow
  console.log("=== USE SERVICES ZIP CODE INFO ===");
  console.log("ZIP code provided to useServices:", zipCode);
  console.log("ZIP code from session storage:", sessionZipCode);
  console.log("Effective ZIP code being used:", effectiveZipCode);
  
  return useQuery({
    queryKey: ['services', effectiveZipCode],
    queryFn: async (): Promise<Service[]> => {
      try {
        // Log before fetching services
        console.log('Fetching services with ZIP code:', effectiveZipCode);
        
        // Step 1: Fetch services based on zipCode
        let services = await fetchServices(effectiveZipCode);
        console.log(`Found ${services.length} services for ZIP code:`, effectiveZipCode);

        // Step 2: If no services exist, insert sample data and fetch again
        if (services.length === 0) {
          console.log('No services found, inserting sample data...');
          await seedSampleData();
          services = await fetchServices(effectiveZipCode);
          console.log(`After seeding, found ${services.length} services`);
        }

        // Step 3: Fetch and attach service details
        return await fetchServiceDetails(services);
      } catch (error) {
        console.error('Unexpected error in useServices:', error);
        return [];
      }
    },
    // Ensure the query re-runs when the ZIP code changes
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: async (): Promise<Service | null> => {
      return await fetchServiceById(id);
    },
    enabled: !!id
  });
};
