
// Sample service data to insert if no data exists
export const sampleServices = [
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
export const sampleServiceDetails = [
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
