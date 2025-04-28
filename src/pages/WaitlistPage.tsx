
import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const WaitlistPage = () => {
  const [searchParams] = useSearchParams();
  const zipCode = searchParams.get("zip") || "";
  const [email, setEmail] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const serviceOptions = [
    "Gutter Cleaning",
    "Pressure Washing", 
    "Window Cleaning",
    "Lawn Care",
    "HVAC Maintenance",
    "House Cleaning",
    "Other"
  ];

  const handleServiceToggle = (service: string) => {
    if (services.includes(service)) {
      setServices(services.filter(s => s !== service));
    } else {
      setServices([...services, service]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      toast.success("Thanks for joining our waitlist!");
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-dwellin-navy hover:underline mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Home</span>
            </Link>
          </div>
          
          {submitted ? (
            <div className="dwellin-card animate-fade-in text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-green-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-3xl font-bold mb-4">You're on the list!</h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Thanks for your interest! We'll notify you as soon as Dwellin is available in your area.
              </p>
              <Link to="/">
                <Button className="bg-dwellin-sky hover:bg-opacity-90 text-white">
                  Return to Home
                </Button>
              </Link>
            </div>
          ) : (
            <div className="dwellin-card">
              <h1 className="text-3xl font-bold mb-2">Join Our Waitlist</h1>
              <p className="text-gray-600 mb-6">
                We're not in your area yet, but we're expanding quickly! Join our waitlist and we'll notify you when Dwellin is available in {zipCode || "your area"}.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
                  <Input 
                    type="email" 
                    id="email" 
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Which services are you interested in?</label>
                  <div className="space-y-2">
                    {serviceOptions.map(service => (
                      <div key={service} className="flex items-center">
                        <Checkbox 
                          id={`service-${service}`}
                          checked={services.includes(service)}
                          onCheckedChange={() => handleServiceToggle(service)}
                        />
                        <label 
                          htmlFor={`service-${service}`}
                          className="ml-2 text-sm font-medium cursor-pointer"
                        >
                          {service}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="comments" className="block text-sm font-medium mb-2">Any specific requests?</label>
                  <Textarea 
                    id="comments" 
                    placeholder="Tell us what home services you need help with..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-dwellin-sky hover:bg-opacity-90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Join Waitlist"
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WaitlistPage;
