
import { useQuery } from "@tanstack/react-query";
import { Service } from "./types";
import { fetchServices, fetchServiceDetails, fetchServiceById, seedSampleData } from "./api";

export const useServices = (zipCode?: string) => {
  // Always prioritize the provided zipCode but check session storage as fallback
  const sessionZipCode = sessionStorage.getItem("zipCode");
  const effectiveZipCode = zipCode || sessionZipCode || "";
  
  return useQuery({
    queryKey: ['services', effectiveZipCode],
    queryFn: async (): Promise<Service[]> => {
      try {
        // Step 1: Fetch services based on zipCode
        let services = await fetchServices(effectiveZipCode);

        // Step 2: If no services exist, insert sample data and fetch again
        if (services.length === 0) {
          console.log('No services found, inserting sample data...');
          await seedSampleData();
          services = await fetchServices(effectiveZipCode);
        }

        // Step 3: Fetch and attach service details
        return await fetchServiceDetails(services);
      } catch (error) {
        console.error('Unexpected error in useServices:', error);
        return [];
      }
    }
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
