import React, { useState, useEffect } from "react";
import ServiceCard from "@/components/ServiceCard";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useServices } from "@/hooks/services";
import { Skeleton } from "@/components/ui/skeleton";

const ServicesList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get ZIP code from URL or session storage
  const urlZipCode = searchParams.get("zip") || "";
  const sessionZipCode = sessionStorage.getItem("zipCode") || "";
  const zipCode = urlZipCode || sessionZipCode;
  
  // If we have a ZIP code in session but not in URL, update URL
  useEffect(() => {
    if (!urlZipCode && sessionZipCode) {
      navigate(`/services?zip=${sessionZipCode}`, { replace: true });
    }
  }, [urlZipCode, sessionZipCode, navigate]);
  
  // Store the ZIP from URL into session if provided
  useEffect(() => {
    if (urlZipCode) {
      sessionStorage.setItem("zipCode", urlZipCode);
    }
  }, [urlZipCode]);
  
  const { data: services, isLoading } = useServices(zipCode);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (services) {
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(services.map(service => service.category))
      );
      setCategories(uniqueCategories);
      
      // If no services are available and we have a zip code, redirect to waitlist page
      if (services.length === 0 && !isLoading && zipCode) {
        navigate(`/unavailable?zip=${zipCode}`);
      }
    }
  }, [services, isLoading, zipCode, navigate]);

  const filteredServices = selectedCategory === "all" 
    ? services 
    : services?.filter(service => service.category === selectedCategory);

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
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="dwellin-card">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : filteredServices && filteredServices.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <ServiceCard key={service.id} service={service} zipCode={zipCode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No services available at this time.</p>
              <Button 
                className="mt-4 bg-dwellin-sky hover:bg-opacity-90 text-white"
                onClick={() => navigate(`/unavailable?zip=${zipCode}`)}
              >
                Join Waitlist
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ServicesList;
