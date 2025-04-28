
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Shield, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        <Hero />
        
        {/* How it works section */}
        <section className="py-20 bg-dwellin-light-gray">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="dwellin-card flex flex-col items-center text-center">
                <div className="bg-dwellin-sky bg-opacity-10 p-4 rounded-full mb-5">
                  <Clock className="h-8 w-8 text-dwellin-sky" />
                </div>
                <h3 className="text-xl font-bold mb-4">1. Book Online</h3>
                <p className="text-gray-600">
                  Choose a service and select a date that works for you. Pay securely online.
                </p>
              </div>
              
              <div className="dwellin-card flex flex-col items-center text-center">
                <div className="bg-dwellin-sky bg-opacity-10 p-4 rounded-full mb-5">
                  <Shield className="h-8 w-8 text-dwellin-sky" />
                </div>
                <h3 className="text-xl font-bold mb-4">2. We Handle It</h3>
                <p className="text-gray-600">
                  We'll assign a vetted pro and coordinate everything. You'll receive updates via text.
                </p>
              </div>
              
              <div className="dwellin-card flex flex-col items-center text-center">
                <div className="bg-dwellin-sky bg-opacity-10 p-4 rounded-full mb-5">
                  <Check className="h-8 w-8 text-dwellin-sky" />
                </div>
                <h3 className="text-xl font-bold mb-4">3. Job Complete</h3>
                <p className="text-gray-600">
                  After service is complete, you'll receive before and after photos in your dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured services */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Popular Services</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Fixed-fee services performed by pre-vetted, insured professionals.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="dwellin-card">
                <h3 className="text-xl font-bold mb-2">Gutter Cleaning</h3>
                <p className="text-gray-600 mb-4">Remove debris from gutters and downspouts</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold">$149</span>
                  <span className="text-sm bg-dwellin-light-gray px-3 py-1 rounded-full">
                    Exterior
                  </span>
                </div>
                <Button className="w-full bg-dwellin-sky hover:bg-opacity-90 text-white">
                  Book Now
                </Button>
              </div>
              
              <div className="dwellin-card">
                <h3 className="text-xl font-bold mb-2">Pressure Washing</h3>
                <p className="text-gray-600 mb-4">Clean driveways, walkways, and patios</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold">$199</span>
                  <span className="text-sm bg-dwellin-light-gray px-3 py-1 rounded-full">
                    Exterior
                  </span>
                </div>
                <Button className="w-full bg-dwellin-sky hover:bg-opacity-90 text-white">
                  Book Now
                </Button>
              </div>
              
              <div className="dwellin-card">
                <h3 className="text-xl font-bold mb-2">Window Cleaning</h3>
                <p className="text-gray-600 mb-4">Interior and exterior window cleaning</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold">$179</span>
                  <span className="text-sm bg-dwellin-light-gray px-3 py-1 rounded-full">
                    Maintenance
                  </span>
                </div>
                <Button className="w-full bg-dwellin-sky hover:bg-opacity-90 text-white">
                  Book Now
                </Button>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link to="/services">
                <Button variant="outline" className="border-dwellin-sky text-dwellin-sky hover:bg-dwellin-sky hover:text-white">
                  <span>View All Services</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-20 bg-dwellin-light-gray">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Homeowners Say</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="dwellin-card">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Booking was super easy and the pro who cleaned our gutters was professional and thorough. Great experience!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-dwellin-navy text-white flex items-center justify-center font-bold">
                    JD
                  </div>
                  <div className="ml-3">
                    <h4 className="font-bold">John D.</h4>
                    <p className="text-sm text-gray-500">Seattle, WA</p>
                  </div>
                </div>
              </div>
              
              <div className="dwellin-card">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Love the fixed pricing model - no surprises. Our pressure washing job turned out fantastic and the before/after photos were impressive."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-dwellin-navy text-white flex items-center justify-center font-bold">
                    SM
                  </div>
                  <div className="ml-3">
                    <h4 className="font-bold">Sarah M.</h4>
                    <p className="text-sm text-gray-500">Portland, OR</p>
                  </div>
                </div>
              </div>
              
              <div className="dwellin-card">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The convenience of scheduling and paying online saved me so much time. The pro was great and I've already booked another service."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-dwellin-navy text-white flex items-center justify-center font-bold">
                    RW
                  </div>
                  <div className="ml-3">
                    <h4 className="font-bold">Robert W.</h4>
                    <p className="text-sm text-gray-500">Denver, CO</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
