
import React, { useState, useEffect } from "react";
import ServiceCard, { Service } from "@/components/ServiceCard";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Mock services data
const MOCK_SERVICES: Service[] = [
  {
    id: "gutter-cleaning",
    name: "Gutter Cleaning",
    base_price: 149,
    description: "Remove debris from gutters and downspouts to prevent water damage",
    category: "Exterior",
    includes: ["Clean all gutters", "Clear downspouts", "Remove debris"],
    excludes: ["Gutter repairs", "Gutter guards installation"]
  },
  {
    id: "pressure-washing",
    name: "Pressure Washing",
    base_price: 199,
    description: "Clean driveways, walkways, and patios with high-pressure water",
    category: "Exterior",
    includes: ["Clean driveway", "Clean walkways", "Clean patio"],
    excludes: ["Deck washing", "Fence washing"]
  },
  {
    id: "window-cleaning",
    name: "Window Cleaning",
    base_price: 179,
    description: "Interior and exterior window cleaning for crystal clear views",
    category: "Maintenance",
    includes: ["Interior window cleaning", "Exterior window cleaning", "Screen cleaning"],
    excludes: ["Window repairs", "Hard water stain removal"]
  },
  {
    id: "lawn-mowing",
    name: "Lawn Mowing",
    base_price: 89,
    description: "Professional lawn mowing service for a well-maintained yard",
    category: "Lawn & Garden",
    includes: ["Mow lawn", "Edge lawn", "Clean up clippings"],
    excludes: ["Fertilization", "Weed control"]
  },
  {
    id: "hvac-maintenance",
    name: "HVAC Maintenance",
    base_price: 159,
    description: "Regular maintenance for your heating and cooling systems",
    category: "Maintenance",
    includes: ["Filter replacement", "System cleaning", "Performance check"],
    excludes: ["Parts replacement", "Major repairs"]
  },
  {
    id: "house-cleaning",
    name: "House Cleaning",
    base_price: 169,
    description: "Comprehensive house cleaning for a fresh and tidy home",
    category: "Interior",
    includes: ["Kitchen cleaning", "Bathroom cleaning", "Vacuuming and mopping"],
    excludes: ["Deep cleaning", "Window washing"]
  }
];

const ServicesList = () => {
  const [searchParams] = useSearchParams();
  const zipCode = searchParams.get("zip") || "";
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setServices(MOCK_SERVICES);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(MOCK_SERVICES.map(service => service.category))
      );
      setCategories(uniqueCategories);
      
      setLoading(false);
    }, 1000);
  }, []);

  const filteredServices = selectedCategory === "all" 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-dwellin-navy hover:underline mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">Available Services</h1>
            {zipCode && (
              <p className="text-gray-600">Services available in {zipCode}</p>
            )}
          </div>
          
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedCategory === "all"
                    ? "bg-dwellin-navy text-white"
                    : "bg-dwellin-light-gray text-dwellin-navy"
                }`}
              >
                All Services
              </button>
              
              {categories.map(category => (
                <button 
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedCategory === category
                      ? "bg-dwellin-navy text-white"
                      : "bg-dwellin-light-gray text-dwellin-navy"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 border-t-2 border-b-2 border-dwellin-sky rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <ServiceCard key={service.id} service={service} zipCode={zipCode} />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ServicesList;
