
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

// Sample service data to insert if no data exists
const sampleServices = [
  {
    name: "Home Cleaning",
    description: "Professional cleaning service for your entire home.",
    base_price: 129,
    category: "Cleaning",
    slug: "home-cleaning",
    zip_code: null, // Available for all zip codes
  },
  {
    name: "Lawn Maintenance",
    description: "Complete lawn care including mowing, edging, and cleanup.",
    base_price: 89,
    category: "Outdoor",
    slug: "lawn-maintenance",
    zip_code: null, // Available for all zip codes
  },
  {
    name: "Handyman Service",
    description: "General repairs and installations around your home.",
    base_price: 110,
    category: "Repairs",
    slug: "handyman-service",
    zip_code: null, // Available for all zip codes
  }
];

// Sample service details
const sampleServiceDetails = [
  // Home Cleaning includes
  { detail_type: 'include', description: "All rooms vacuumed and mopped" },
  { detail_type: 'include', description: "Bathroom and kitchen deep cleaned" },
  { detail_type: 'include', description: "Dusting of all surfaces" },
  // Home Cleaning excludes
  { detail_type: 'exclude', description: "Window washing" },
  { detail_type: 'exclude', description: "Laundry services" },
  
  // Lawn Maintenance includes
  { detail_type: 'include', description: "Lawn mowing" },
  { detail_type: 'include', description: "Edging of walkways" },
  { detail_type: 'include', description: "Debris cleanup" },
  // Lawn Maintenance excludes
  { detail_type: 'exclude', description: "Tree trimming" },
  { detail_type: 'exclude', description: "Fertilization" },
  
  // Handyman includes
  { detail_type: 'include', description: "Minor repairs" },
  { detail_type: 'include', description: "Furniture assembly" },
  { detail_type: 'include', description: "Picture hanging" },
  // Handyman excludes
  { detail_type: 'exclude', description: "Major electrical work" },
  { detail_type: 'exclude', description: "Plumbing replacements" }
];

export const useServices = (zipCode?: string) => {
  return useQuery({
    queryKey: ['services', zipCode],
    queryFn: async (): Promise<Service[]> => {
      try {
        // Fetch services based on zipCode
        let query = supabase.from('services').select('*');
        
        // If zipCode is provided, filter by it or include services with null zip_code
        if (zipCode) {
          query = query.or(`zip_code.eq.${zipCode},zip_code.is.null`);
        }
        
        const { data: servicesData, error } = await query.order('name');
        
        if (error) {
          console.error('Error fetching services:', error);
          toast.error('Failed to load services');
          throw error;
        }

        // If no services exist, insert sample data and fetch them again
        if (!servicesData || servicesData.length === 0) {
          console.log('No services found, inserting sample data...');
          
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
          for (const service of insertedServices) {
            const serviceDetails = [];
            
            // Distribute sample details across services
            const serviceIndex = insertedServices.indexOf(service);
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
          }
          
          // Fetch the newly created services with query that handles the zipCode filter
          let refreshedQuery = supabase.from('services').select('*');
          if (zipCode) {
            refreshedQuery = refreshedQuery.or(`zip_code.eq.${zipCode},zip_code.is.null`);
          }
          const { data: refreshedServices, error: refreshError } = await refreshedQuery.order('name');
          
          if (refreshError) {
            console.error('Error fetching refreshed services:', refreshError);
            toast.error('Failed to load services');
            return [];
          }
          
          // Fetch service details for all services
          const { data: details, error: detailsError } = await supabase
            .from('service_details')
            .select('*');
          
          if (detailsError) {
            console.error('Error fetching service details:', detailsError);
            toast.error('Failed to load service details');
            return [];
          }

          // Process and organize the service details
          return (refreshedServices || []).map(service => {
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
        }

        // Fetch service details for all services
        const { data: details, error: detailsError } = await supabase
          .from('service_details')
          .select('*');
        
        if (detailsError) {
          console.error('Error fetching service details:', detailsError);
          toast.error('Failed to load service details');
          throw detailsError;
        }

        // Process and organize the service details
        return servicesData.map(service => {
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
      // Fetch the specific service
      const { data: service, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching service:', error);
        toast.error('Failed to load service details');
        throw error;
      }

      if (!service) {
        return null;
      }

      // Fetch service details for this service
      const { data: details, error: detailsError } = await supabase
        .from('service_details')
        .select('*')
        .eq('service_id', id);
      
      if (detailsError) {
        console.error('Error fetching service details:', detailsError);
        toast.error('Failed to load service details');
        throw detailsError;
      }

      // Process and organize the service details
      const includes = details
        .filter(detail => detail.detail_type === 'include')
        .map(detail => ({
          id: detail.id,
          detail_type: 'include' as const,
          description: detail.description
        }));
      
      const excludes = details
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
    },
    enabled: !!id
  });
};
