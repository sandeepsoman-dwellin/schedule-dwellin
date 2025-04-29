
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
}

export const useServices = (zipCode?: string) => {
  return useQuery({
    queryKey: ['services', zipCode],
    queryFn: async (): Promise<Service[]> => {
      // Fetch all services
      const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
        throw error;
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
      return services.map(service => {
        const serviceDetails = details.filter(detail => detail.service_id === service.id);
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
