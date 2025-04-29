
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ServiceDetail = {
  id: string;
  detail_type: 'include' | 'exclude';
  description: string;
}

export type Service = {
  id: string;
  slug: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  includes: ServiceDetail[];
  excludes: ServiceDetail[];
  zip_code: string | null;
}

// Sample data has been moved to a separate file for cleaner organization
import { sampleServices, sampleServiceDetails } from "./useServicesData";

// Helper function to fetch services
const fetchServices = async (zipCode?: string) => {
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

  return services || [];
};

// Helper function to seed sample data if none exists
const seedSampleData = async () => {
  try {
    // Insert sample services
    const { data: insertedServices, error: insertError } = await supabase
      .from('services')
      .insert(sampleServices)
      .select();
    
    if (insertError) {
      console.error('Error inserting sample services:', insertError);
      toast.error('Failed to create sample services');
      return [];
    }
    
    // Insert service details for each service
    await Promise.all(insertedServices.map(async (service, serviceIndex) => {
      const serviceDetails = [];
      
      // Distribute sample details across services
      const startIdx = serviceIndex * 5; // 5 details per service
      
      for (let i = startIdx; i < startIdx + 5 && i < sampleServiceDetails.length; i++) {
        serviceDetails.push({
          ...sampleServiceDetails[i],
          service_id: service.id
        });
      }
      
      const { error: detailsError } = await supabase
        .from('service_details')
        .insert(serviceDetails);
      
      if (detailsError) {
        console.error('Error inserting service details:', detailsError);
      }
    }));
    
    return insertedServices;
  } catch (error) {
    console.error('Error seeding sample data:', error);
    return [];
  }
};

// Helper function to fetch service details
// Fix: Define specific types for input and output to prevent recursive type issues
const fetchServiceDetails = async (services: Array<{
  id: string;
  slug: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  zip_code: string | null;
}>): Promise<Service[]> => {
  if (!services || services.length === 0) {
    return [];
  }

  const { data: details, error: detailsError } = await supabase
    .from('service_details')
    .select('*');
  
  if (detailsError) {
    console.error('Error fetching service details:', detailsError);
    toast.error('Failed to load service details');
    throw detailsError;
  }

  // Process and organize the service details
  return services.map(service => {
    const serviceDetails = details ? details.filter(detail => detail.service_id === service.id) : [];
    
    const includes = serviceDetails
      .filter(detail => detail.detail_type === 'include')
      .map(detail => ({
        id: detail.id,
        detail_type: 'include' as const,
        description: detail.description
      }));
    
    const excludes = serviceDetails
      .filter(detail => detail.detail_type === 'exclude')
      .map(detail => ({
        id: detail.id,
        detail_type: 'exclude' as const,
        description: detail.description
      }));

    return {
      ...service,
      includes,
      excludes
    };
  });
};

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
        toast.error('An unexpected error occurred while loading services');
        return [];
      }
    }
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: async (): Promise<Service | null> => {
      try {
        // First check if this is a slug or ID - if it contains hyphens, it's likely a slug
        let queryField = 'id';
        if (id && id.includes('-')) {
          queryField = 'slug';
        }

        // Query by either ID or slug
        const { data: service, error } = await supabase
          .from('services')
          .select('*')
          .eq(queryField, id)
          .maybeSingle();
        
        if (error) {
          console.error(`Error fetching service by ${queryField}:`, error);
          toast.error('Failed to load service details');
          throw error;
        }

        if (!service) {
          console.log(`No service found with ${queryField}:`, id);
          return null;
        }

        // Fetch service details specifically for this service
        const { data: details, error: detailsError } = await supabase
          .from('service_details')
          .select('*')
          .eq('service_id', service.id);
        
        if (detailsError) {
          console.error('Error fetching service details:', detailsError);
          toast.error('Failed to load service details');
          throw detailsError;
        }

        // Process and organize the service details
        const includes = (details || [])
          .filter(detail => detail.detail_type === 'include')
          .map(detail => ({
            id: detail.id,
            detail_type: 'include' as const,
            description: detail.description
          }));
        
        const excludes = (details || [])
          .filter(detail => detail.detail_type === 'exclude')
          .map(detail => ({
            id: detail.id,
            detail_type: 'exclude' as const,
            description: detail.description
          }));

        return {
          ...service,
          includes,
          excludes
        };
      } catch (error) {
        console.error('Error in useService:', error);
        toast.error('Failed to load service details');
        return null;
      }
    },
    enabled: !!id
  });
};
