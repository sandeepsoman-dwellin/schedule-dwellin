
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Service } from "@/hooks/services";

interface ServiceCardProps {
  service: Service;
  zipCode: string;
  onBookNow?: (serviceId: string) => void;
}

const ServiceCard = ({ service, zipCode, onBookNow }: ServiceCardProps) => {
  const handleBookNowClick = (e: React.MouseEvent) => {
    if (onBookNow) {
      e.preventDefault();
      onBookNow(service.id);
    }
  };

  return (
    <div className="dwellin-card hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">{service.name}</h3>
          <p className="text-gray-600 mb-4">{service.description}</p>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xl font-bold">${service.base_price}</span>
            <span className="text-sm bg-dwellin-light-gray px-3 py-1 rounded-full">
              {service.category}
            </span>
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-100">
          {onBookNow ? (
            <Button className="w-full bg-dwellin-sky hover:bg-opacity-90 text-white" onClick={handleBookNowClick}>
              <span>Book Now</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Link to={`/services/${service.id}?zip=${zipCode}`}>
              <Button className="w-full bg-dwellin-sky hover:bg-opacity-90 text-white">
                <span>Book Now</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
