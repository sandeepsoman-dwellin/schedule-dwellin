
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Service, ServiceBase, ServiceDetail } from "./types";
import { sampleServices, sampleServiceDetails } from "./sampleData";

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

  return services || [];
};

// Helper function to seed sample data if none exists
export const seedSampleData = async (): Promise<ServiceBase[]> => {
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
export const fetchServiceDetails = async (services: ServiceBase[]): Promise<Service[]> => {
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

  // Process and organize the service details with explicit type annotations
  const result: Service[] = services.map((service): Service => {
    const serviceDetails = details ? details.filter(detail => detail.service_id === service.id) : [];
    
    const includes: ServiceDetail[] = serviceDetails
      .filter(detail => detail.detail_type === 'include')
      .map(detail => ({
        id: detail.id,
        detail_type: 'include' as const,
        description: detail.description
      }));
    
    const excludes: ServiceDetail[] = serviceDetails
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

  return result;
};

// Function to fetch a single service by ID or slug
export const fetchServiceById = async (id: string): Promise<Service | null> => {
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

    // Process and organize the service details with explicit typing
    const serviceData = service as ServiceBase;
    
    const includes: ServiceDetail[] = (details || [])
      .filter(detail => detail.detail_type === 'include')
      .map(detail => ({
        id: detail.id,
        detail_type: 'include' as const,
        description: detail.description
      }));
    
    const excludes: ServiceDetail[] = (details || [])
      .filter(detail => detail.detail_type === 'exclude')
      .map(detail => ({
        id: detail.id,
        detail_type: 'exclude' as const,
        description: detail.description
      }));

    // Explicitly construct the service object with the correct type
    const fullService: Service = {
      ...serviceData,
      includes,
      excludes
    };

    return fullService;
  } catch (error) {
    console.error('Error in fetchServiceById:', error);
    toast.error('Failed to load service details');
    return null;
  }
};
