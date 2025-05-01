
import { useQuery } from "@tanstack/react-query";
import { Service } from "./types";
import { fetchServices, fetchServiceDetails, fetchServiceById, seedSampleData } from "./api";

export const useServices = (zipCode?: string) => {
  return useQuery({
    queryKey: ['services', zipCode],
    queryFn: async (): Promise<Service[]> => {
      try {
        // Step 1: Fetch services based on zipCode
        let services = await fetchServices(zipCode);

        // Step 2: If no services exist, insert sample data and fetch again
        if (services.length === 0) {
          console.log('No services found, inserting sample data...');
          await seedSampleData();
          services = await fetchServices(zipCode);
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
