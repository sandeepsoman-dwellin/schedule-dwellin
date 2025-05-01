
import { ServiceBase, ServiceDetail, Service } from "../types";

// Export any API-specific types or extend existing ones if needed
export type ServiceQueryOptions = {
  zipCode?: string;
};

export type ServiceApiResponse = {
  services: ServiceBase[];
  error?: Error;
};

export type ServiceDetailsApiResponse = {
  service: Service | null;
  error?: Error;
};
