
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Testimonial = {
  id: string;
  customer_name: string;
  customer_location: string;
  rating: number;
  content: string;
}

// Sample testimonials data to insert if none exists
const sampleTestimonials = [
  {
    customer_name: "Sarah Johnson",
    customer_location: "San Francisco, CA",
    rating: 5,
    content: "I've used Dwellin for multiple services and have always been impressed with their professionalism and attention to detail. The booking process is seamless and the service providers are top-notch."
  },
  {
    customer_name: "Michael Chen",
    customer_location: "Seattle, WA",
    rating: 4,
    content: "The handyman service was excellent. He arrived on time, completed all tasks efficiently, and cleaned up afterward. I'll definitely be using Dwellin again for future home projects."
  },
  {
    customer_name: "Emily Rodriguez",
    customer_location: "Austin, TX",
    rating: 5,
    content: "As a busy professional, I love that Dwellin handles everything from finding reliable service providers to scheduling and payment. Their home cleaning service exceeded my expectations!"
  }
];

export const useTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async (): Promise<Testimonial[]> => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching testimonials:', error);
          toast.error('Failed to load testimonials');
          throw error;
        }

        // If no testimonials exist, insert sample data
        if (!data || data.length === 0) {
          console.log('No testimonials found, inserting sample data...');
          
          const { data: insertedTestimonials, error: insertError } = await supabase
            .from('testimonials')
            .insert(sampleTestimonials)
            .select();
          
          if (insertError) {
            console.error('Error inserting sample testimonials:', insertError);
            toast.error('Failed to create sample testimonials');
            return [];
          }
          
          return insertedTestimonials;
        }

        return data;
      } catch (error) {
        console.error('Unexpected error in useTestimonials:', error);
        toast.error('An unexpected error occurred while loading testimonials');
        return [];
      }
    }
  });
};
