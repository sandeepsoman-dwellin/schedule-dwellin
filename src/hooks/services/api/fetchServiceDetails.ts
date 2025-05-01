
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Service, ServiceBase, ServiceDetail } from "../types";

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

  // Create service objects with explicit type construction
  return services.map((service) => {
    // Filter details for current service
    const serviceDetails = details ? details.filter(detail => detail.service_id === service.id) : [];

    // Create arrays with explicit type annotations
    const includeItems: ServiceDetail[] = [];
    const excludeItems: ServiceDetail[] = [];
    
    // Manually populate the arrays
    serviceDetails.forEach(detail => {
      if (detail.detail_type === 'include') {
        includeItems.push({
          id: detail.id,
          detail_type: 'include',
          description: detail.description
        });
      } else if (detail.detail_type === 'exclude') {
        excludeItems.push({
          id: detail.id,
          detail_type: 'exclude', 
          description: detail.description
        });
      }
    });

    // Return a service object with explicit structure
    return {
      id: service.id,
      slug: service.slug,
      name: service.name,
      description: service.description,
      base_price: service.base_price,
      category: service.category,
      zip_code: service.zip_code,
      includes: includeItems,
      excludes: excludeItems
    };
  });
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

    // Create simple typed arrays
    const includeItems: ServiceDetail[] = [];
    const excludeItems: ServiceDetail[] = [];
    
    // Process details if they exist
    if (details) {
      details.forEach(detail => {
        if (detail.detail_type === 'include') {
          includeItems.push({
            id: detail.id,
            detail_type: 'include',
            description: detail.description
          });
        } else if (detail.detail_type === 'exclude') {
          excludeItems.push({
            id: detail.id,
            detail_type: 'exclude',
            description: detail.description
          });
        }
      });
    }

    // Return a properly typed service object
    return {
      id: service.id,
      slug: service.slug,
      name: service.name,
      description: service.description,
      base_price: service.base_price,
      category: service.category,
      zip_code: service.zip_code,
      includes: includeItems,
      excludes: excludeItems
    };
  } catch (error) {
    console.error('Error in fetchServiceById:', error);
    toast.error('Failed to load service details');
    return null;
  }
};
