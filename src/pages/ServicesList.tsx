
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
import { validateZipCode } from "@/hooks/useGooglePlaces";
import { toast } from "sonner";

const ServicesList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Enhanced ZIP code handling with validation
  const sessionZipCode = sessionStorage.getItem("zipCode") || "";
  const urlZipCode = searchParams.get("zip") || "";
  
  // DEBUG: Log ZIP code sources
  console.log("=== SERVICES LIST ZIP CODE ANALYSIS ===");
  console.log("ServicesList - URL ZIP code:", urlZipCode);
  console.log("ServicesList - Session ZIP code:", sessionZipCode);
  console.log("URL ZIP valid:", validateZipCode(urlZipCode));
  console.log("Session ZIP valid:", validateZipCode(sessionZipCode));
  
  // Prioritize valid ZIP codes
  let zipCode = '';
  if (urlZipCode && validateZipCode(urlZipCode)) {
    zipCode = urlZipCode;
  } else if (sessionZipCode && validateZipCode(sessionZipCode)) {
    zipCode = sessionZipCode;
  }
  
  console.log("ServicesList - Final ZIP code to use:", zipCode);
  
  // Enhanced URL synchronization with validation
  useEffect(() => {
    if (!urlZipCode && zipCode && validateZipCode(zipCode)) {
      // Update URL with valid ZIP code from session storage
      console.log("Updating URL with session ZIP code:", zipCode);
      setSearchParams({ zip: zipCode });
    } else if (urlZipCode && validateZipCode(urlZipCode) && urlZipCode !== sessionZipCode) {
      // Update session storage if URL has different valid ZIP code
      console.log("Updating session storage with URL ZIP code:", urlZipCode);
      sessionStorage.setItem("zipCode", urlZipCode);
      localStorage.setItem("zipCode", urlZipCode);
    } else if (urlZipCode && !validateZipCode(urlZipCode)) {
      // Handle invalid ZIP code in URL
      console.warn("Invalid ZIP code in URL:", urlZipCode);
      toast.error("Invalid ZIP code format. Please enter a valid 5-digit ZIP code.");
      
      if (sessionZipCode && validateZipCode(sessionZipCode)) {
        // Redirect to valid session ZIP code
        setSearchParams({ zip: sessionZipCode });
      } else {
        // Redirect to home if no valid ZIP code
        navigate("/");
      }
    }
  }, [urlZipCode, sessionZipCode, zipCode, navigate, setSearchParams]);
  
  // Always ensure the query is made with a valid ZIP code
  const { data: services, isLoading, error } = useServices(zipCode);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (services) {
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(services.map(service => service.category))
      );
      setCategories(uniqueCategories);
      
      // Enhanced service availability logic - redirect to waitlist if no services
      if (services.length === 0 && !isLoading && zipCode && validateZipCode(zipCode)) {
        console.log(`No services available for ZIP code ${zipCode}, redirecting to waitlist`);
        navigate(`/unavailable?zip=${zipCode}`);
      } else if (!zipCode && !isLoading) {
        console.log("No ZIP code available, redirecting to home");
        navigate("/");
      }
    }
  }, [services, isLoading, zipCode, navigate]);

  // Handle loading and error states
  if (error) {
    console.error("Error loading services:", error);
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Services</h1>
            <p className="text-gray-600 mb-4">There was a problem loading the services. Please try again.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
            {zipCode && validateZipCode(zipCode) && (
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
              <p className="text-gray-500">No services available{zipCode ? ` in ${zipCode}` : ''} at this time.</p>
              <Button 
                className="mt-4 bg-dwellin-sky hover:bg-opacity-90 text-white"
                onClick={() => navigate(zipCode ? `/unavailable?zip=${zipCode}` : '/unavailable')}
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
