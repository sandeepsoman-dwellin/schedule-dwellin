import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, Check, Phone, Mail, Info, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Service } from "@/components/ServiceCard";

// Mock pro data
const MOCK_PROS = [
  {
    id: "pro-1",
    name: "Michael Rodriguez",
    image: "/placeholder.svg",
    bio: "Over 15 years of experience in home maintenance. I take pride in exceptional quality and attention to detail.",
    yearsOfExperience: 15,
    rating: 4.9,
    completedJobs: 328
  },
  {
    id: "pro-2",
    name: "Sarah Johnson",
    image: "/placeholder.svg",
    bio: "Certified home service professional with a background in construction. I treat every home as if it were my own.",
    yearsOfExperience: 8,
    rating: 4.8,
    completedJobs: 215
  }
];

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

const ServiceDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const zipCode = searchParams.get("zip") || "";
  const [service, setService] = useState<Service | null>(null);
  const [selectedPro, setSelectedPro] = useState(MOCK_PROS[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const foundService = MOCK_SERVICES.find(service => service.id === id);
      if (foundService) {
        setService(foundService);
      }
      
      // Randomly select a pro for this service
      const randomProIndex = Math.floor(Math.random() * MOCK_PROS.length);
      setSelectedPro(MOCK_PROS[randomProIndex]);
      
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center flex-grow py-12">
          <div className="h-10 w-10 border-t-2 border-b-2 border-dwellin-sky rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Service Not Found</h2>
          <p className="mb-6">We couldn't find the service you're looking for.</p>
          <Link to="/services">
            <Button>Return to Services</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Service Header */}
          <div className="mb-8">
            <Link to={`/services?zip=${zipCode}`} className="text-dwellin-navy hover:underline mb-4 inline-flex items-center">
              ← Back to Services
            </Link>
            
            <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">{service.name}</h1>
                <p className="text-gray-600 mt-2">{service.description}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="text-3xl font-bold">${service.base_price}</span>
                <span className="ml-2 text-gray-500">fixed price</span>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h2 className="text-xl font-bold mb-4">What's Included</h2>
              <ul className="space-y-2">
                {service.includes.map((item, index) => (
                  <li key={`included-${index}`} className="flex items-start">
                    <Check className="text-dwellin-sky mr-2 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h2 className="text-xl font-bold mt-8 mb-4">What's Not Included</h2>
              <ul className="space-y-2">
                {service.excludes.map((item, index) => (
                  <li key={`excluded-${index}`} className="flex items-start text-gray-600">
                    <span className="mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Pro Card */}
            <div>
              <h2 className="text-xl font-bold mb-4">Meet Your Pro</h2>
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="h-16 w-16 border-2 border-dwellin-sky">
                    <AvatarImage src={selectedPro.image} alt={selectedPro.name} />
                    <AvatarFallback className="bg-dwellin-navy text-white text-xl">
                      {selectedPro.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold">{selectedPro.name}</h3>
                    <div className="flex items-center">
                      <Award className="h-4 w-4 text-dwellin-sky mr-1" />
                      <span className="text-sm">{selectedPro.rating} stars • {selectedPro.completedJobs}+ jobs</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{selectedPro.bio}</p>
                
                <div className="text-sm">
                  <p className="mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-dwellin-sky" /> 
                    {selectedPro.yearsOfExperience} years of experience
                  </p>
                  <p className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-dwellin-sky" /> 
                    Background checked & insured
                  </p>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Important Details Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Important Details</h2>
            
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
              <div>
                <h3 className="font-bold mb-2 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-dwellin-sky" />
                  Scheduling Policy
                </h3>
                <p className="text-gray-700">
                  Your chosen date may be adjusted by up to 5 business days in case of scheduling conflicts. 
                  We'll always confirm any changes with you in advance. This offer is valid for 30 days.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-dwellin-sky" />
                  60-Day Warranty
                </h3>
                <p className="text-gray-700">
                  All services come with a 60-day warranty. If you're not satisfied, we'll fix it at no cost 
                  (unless the work has been modified by another party).
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-dwellin-sky" />
                  Customer Support
                </h3>
                <p className="text-gray-700 mb-1">
                  Questions before or after your service? We're here to help!
                </p>
                <p className="text-dwellin-navy">
                  <Phone className="h-4 w-4 inline mr-1" /> (800) 555-1234<br />
                  <Mail className="h-4 w-4 inline mr-1" /> support@dwellin.com
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-dwellin-sky" />
                  Referral Credit
                </h3>
                <p className="text-gray-700">
                  Each completed service earns you a $25 credit towards your next service booking. 
                  Credits are automatically applied to your account.
                </p>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Schedule Your Service?</h2>
            <p className="mb-6 max-w-xl mx-auto">
              Choose a convenient date and time for your {service.name.toLowerCase()}, and our professional 
              will take care of the rest.
            </p>
            <Link to={`/booking?service=${id}&zip=${zipCode}`}>
              <Button className="bg-dwellin-sky hover:bg-opacity-90 text-white px-8 py-6 text-lg">
                Schedule Now
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceDetail;
