
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sampleServices, sampleServiceDetails } from "../sampleData";
import { ServiceBase } from "../types";

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
