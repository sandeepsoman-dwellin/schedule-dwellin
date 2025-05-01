
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Service, ServiceBase, ServiceDetail } from "../types";

// Fetch service details for a list of services
export const fetchServiceDetails = async (services: ServiceBase[]): Promise<Service[]> => {
  try {
    // Create an array to hold our complete services
    const servicesWithDetails: Service[] = [];
    
    // For each service, fetch its details
    for (const service of services) {
      const fullService = await fetchServiceById(service.id);
      if (fullService) {
        servicesWithDetails.push(fullService);
      }
    }
    
    return servicesWithDetails;
  } catch (error) {
    console.error('Error fetching service details:', error);
    toast.error('Failed to load service details');
    return [];
  }
};

// Fetch a specific service by ID and include its details
export const fetchServiceById = async (id: string): Promise<Service | null> => {
  try {
    // Step 1: Fetch the base service
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    
    if (serviceError) {
      console.error('Error fetching service:', serviceError);
      toast.error('Failed to load service');
      return null;
    }
    
    if (!serviceData) {
      return null;
    }
    
    // Step 2: Fetch service details (includes and excludes)
    const { data: detailsData, error: detailsError } = await supabase
      .from('service_details')
      .select('*')
      .eq('service_id', id);
    
    if (detailsError) {
      console.error('Error fetching service details:', detailsError);
      // Continue with the service data we have
    }
    
    // Prepare the includes and excludes arrays
    const includes: ServiceDetail[] = [];
    const excludes: ServiceDetail[] = [];
    
    if (detailsData) {
      detailsData.forEach(detail => {
        const serviceDetail: ServiceDetail = {
          id: detail.id,
          detail_type: detail.detail_type as 'include' | 'exclude',
          description: detail.description
        };
        
        if (detail.detail_type === 'include') {
          includes.push(serviceDetail);
        } else if (detail.detail_type === 'exclude') {
          excludes.push(serviceDetail);
        }
      });
    }
    
    // Create and return the full service object
    const service: Service = {
      ...serviceData,
      includes,
      excludes
    };
    
    return service;
  } catch (error) {
    console.error('Error in fetchServiceById:', error);
    toast.error('Failed to load service details');
    return null;
  }
};
