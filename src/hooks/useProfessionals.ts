
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Professional = {
  id: string;
  slug: string;
  name: string;
  image_url: string;
  bio: string;
  years_experience: number;
  rating: number;
  completed_jobs: number;
}

export const useProfessionals = () => {
  return useQuery({
    queryKey: ['professionals'],
    queryFn: async (): Promise<Professional[]> => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching professionals:', error);
        toast.error('Failed to load professionals');
        throw error;
      }

      return data;
    }
  });
};

export const useProfessionalsByService = (serviceId: string) => {
  return useQuery({
    queryKey: ['professionals', 'service', serviceId],
    queryFn: async (): Promise<Professional[]> => {
      // Get the professional IDs associated with this service
      const { data: relationships, error: relError } = await supabase
        .from('service_professionals')
        .select('professional_id')
        .eq('service_id', serviceId);
      
      if (relError) {
        console.error('Error fetching service professionals:', relError);
        toast.error('Failed to load professionals');
        throw relError;
      }
      
      if (!relationships || relationships.length === 0) {
        return [];
      }

      const professionalIds = relationships.map(rel => rel.professional_id);

      // Get the professional details
      const { data: professionals, error } = await supabase
        .from('professionals')
        .select('*')
        .in('id', professionalIds)
        .order('name');
      
      if (error) {
        console.error('Error fetching professionals:', error);
        toast.error('Failed to load professionals');
        throw error;
      }

      return professionals;
    },
    enabled: !!serviceId
  });
};
