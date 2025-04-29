
import React, { useState } from "react";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Clock, Shield, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useTestimonials } from "@/hooks/useTestimonials";
import { useServices } from "@/hooks/useServices";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: testimonials, isLoading: isLoadingTestimonials } = useTestimonials();
  const { data: services, isLoading: isLoadingServices } = useServices();

  // Get the first 3 services for featured display
  const featuredServices = services?.slice(0, 3) || [];

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
              {isLoadingServices ? (
                // Loading skeletons for services
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="dwellin-card">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex justify-between items-center mb-4">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))
              ) : featuredServices.length > 0 ? (
                // Display actual services
                featuredServices.map((service) => (
                  <div key={service.id} className="dwellin-card">
                    <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold">${service.base_price}</span>
                      <span className="text-sm bg-dwellin-light-gray px-3 py-1 rounded-full">
                        {service.category}
                      </span>
                    </div>
                    <Link to={`/services/${service.slug}${location.search}`}>
                      <Button className="w-full bg-dwellin-sky hover:bg-opacity-90 text-white">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">No services available at this time.</p>
                </div>
              )}
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
              {isLoadingTestimonials ? (
                // Loading skeletons for testimonials
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="dwellin-card">
                    <div className="flex mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Skeleton key={star} className="h-5 w-5 mr-1" />
                      ))}
                    </div>
                    <Skeleton className="h-24 w-full mb-4" />
                    <div className="flex items-center">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="ml-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32 mt-1" />
                      </div>
                    </div>
                  </div>
                ))
              ) : testimonials && testimonials.length > 0 ? (
                // Display actual testimonials
                testimonials.slice(0, 3).map((testimonial) => (
                  <div key={testimonial.id} className="dwellin-card">
                    <div className="flex mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-5 w-5 ${star <= testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-dwellin-navy text-white flex items-center justify-center font-bold">
                        {testimonial.customer_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-3">
                        <h4 className="font-bold">{testimonial.customer_name}</h4>
                        <p className="text-sm text-gray-500">{testimonial.customer_location}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">No testimonials available at this time.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
