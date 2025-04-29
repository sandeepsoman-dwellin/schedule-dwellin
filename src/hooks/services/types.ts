
// Service-related type definitions
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

export type ServiceBase = Omit<Service, 'includes' | 'excludes'>;
