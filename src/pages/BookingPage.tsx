
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { format, addDays, isWeekend, parseISO } from 'date-fns';
import { CalendarIcon, Clock, Info, CreditCard, Check } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchServiceById } from '@/hooks/services/serviceApi';
import { createBooking, BookingFormData } from '@/hooks/bookings/bookingApi';

// Time slots available for booking
const TIME_SLOTS = [
  { id: "morning", label: "Morning (8AM - 12PM)", value: "8AM - 12PM" },
  { id: "afternoon", label: "Afternoon (12PM - 4PM)", value: "12PM - 4PM" },
  { id: "evening", label: "Evening (4PM - 8PM)", value: "4PM - 8PM" },
];

// Define form schema using zod
const bookingFormSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone number is required" }),
  date: z.date({ required_error: "Please select a date" }),
  timeSlot: z.string({ required_error: "Please select a time slot" }),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const BookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('service') || '';
  const zipCode = searchParams.get('zip') || '';
  
  // Use React Query to fetch the service data
  const { data: service, isLoading: serviceLoading, error: serviceError } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => fetchServiceById(serviceId),
    enabled: !!serviceId,
  });
  
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  
  // New state for payment modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Get dates starting from 2 business days from now
  const getAvailableDates = () => {
    const today = new Date();
    let startDate = addDays(today, 2);
    
    // If it's a weekend, move to next Monday
    while (isWeekend(startDate)) {
      startDate = addDays(startDate, 1);
    }
    
    return startDate;
  };

  // Initialize the form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      notes: '',
    },
  });

  // Handle form submission
  const onSubmit = (values: BookingFormValues) => {
    console.log("Form values:", values);
    setIsPaymentModalOpen(true);
  };

  // Handle payment completion
  const handlePaymentCompletion = async () => {
    if (!service) return;
    
    setIsPaymentModalOpen(false);
    setIsPaymentProcessing(true);
    
    const formValues = form.getValues();
    
    try {
      // Save booking to database
      const createdBookingId = await createBooking({
        ...formValues,
        serviceId: service.id,
        paymentAmount: service.base_price,
        zipCode
      });
      
      if (createdBookingId) {
        setBookingId(createdBookingId);
        setIsPaymentProcessing(false);
        setShowThankYou(true);
        
        toast.success("Payment successful!", {
          description: "Your booking has been confirmed.",
        });
      } else {
        setIsPaymentProcessing(false);
        toast.error("Failed to complete booking", {
          description: "Please try again or contact support.",
        });
      }
    } catch (error) {
      console.error("Error completing booking:", error);
      setIsPaymentProcessing(false);
      toast.error("Failed to complete booking", {
        description: "Please try again or contact support.",
      });
    }
  };

  // If service is loading
  if (serviceLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Loading service details...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  // If service not found
  if (serviceError || !service) {
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
  
  // Thank you screen after successful payment
  if (showThankYou) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">Thank You For Your Booking!</h1>
            <p className="mb-6 text-lg">
              Your {service.name} service has been scheduled. You will receive a confirmation email shortly.
            </p>
            <p className="mb-2 text-gray-600">
              A professional will contact you before the scheduled date to confirm the details.
            </p>
            {bookingId && (
              <p className="mb-6 text-sm text-gray-500">
                Booking Reference: {bookingId}
              </p>
            )}
            <Link to="/">
              <Button className="bg-dwellin-sky hover:bg-opacity-90">Return to Home</Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to={`/services/${service.slug || service.id}?zip=${zipCode}`} className="text-dwellin-navy hover:underline mb-4 inline-flex items-center">
            ← Back to Service Details
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-2">Book Your {service.name}</h1>
          <p className="text-gray-600 mb-8">{service.description}</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Booking Form - Takes 2/3 of the width on desktop */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Your Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Contact Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contact Information</h3>
                        
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="your@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="(123) 456-7890" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      {/* Date & Time Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Select Date & Time</h3>
                        <p className="text-sm text-gray-500">Choose from available dates starting 2 business days from today</p>
                        
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Service Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={`w-full justify-start text-left font-normal ${
                                        !field.value && "text-muted-foreground"
                                      }`}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Select a date</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => {
                                      // Disable dates before the earliest available date
                                      // Also disable weekends
                                      return date < getAvailableDates() || isWeekend(date);
                                    }}
                                    initialFocus
                                    className="p-3 pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="timeSlot"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Time</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a time slot" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {TIME_SLOTS.map((slot) => (
                                    <SelectItem key={slot.id} value={slot.id}>
                                      {slot.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* Special Instructions */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Special Instructions (Optional)</h3>
                        
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Notes</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Any specific instructions or details about your home or service needs..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Share any details that might help our professional provide better service.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="pt-4 lg:hidden">
                        <Button 
                          type="submit" 
                          className="w-full bg-dwellin-sky hover:bg-opacity-90 text-white py-6"
                          disabled={isPaymentProcessing}
                        >
                          {isPaymentProcessing ? (
                            <>Processing...</>
                          ) : (
                            <>Proceed to Payment</>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            {/* Order Summary - Takes 1/3 of the width on desktop */}
            <div>
              <div className="sticky top-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>{service.name}</span>
                      <span>${service.base_price}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${service.base_price}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Fixed price, no hidden fees
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col">
                    <Button 
                      onClick={form.handleSubmit(onSubmit)}
                      className="w-full bg-dwellin-sky hover:bg-opacity-90 text-white py-6 mb-4"
                      disabled={isPaymentProcessing}
                    >
                      {isPaymentProcessing ? (
                        <>
                          <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-5 w-5" />
                          Pay Now
                        </>
                      )}
                    </Button>
                    
                    {/* Trust Building Elements */}
                    <div className="space-y-3 bg-gray-50 p-4 rounded-md text-sm">
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <p>Your card is only authorized today. Payment is processed after the service is completed.</p>
                      </div>
                      
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <p>All services include our 60-day Satisfaction Guarantee</p>
                      </div>
                      
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <p>Vetted, background-checked professionals</p>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Enter Payment Information</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Mock Credit Card Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">Card Number</label>
                <Input id="card-number" placeholder="1234 5678 9012 3456" className="mt-1" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiration" className="block text-sm font-medium text-gray-700">Expiration</label>
                  <Input id="expiration" placeholder="MM / YY" className="mt-1" />
                </div>
                <div>
                  <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">CVC</label>
                  <Input id="cvc" placeholder="123" className="mt-1" />
                </div>
              </div>
              
              <div>
                <label htmlFor="card-name" className="block text-sm font-medium text-gray-700">Name on Card</label>
                <Input id="card-name" placeholder="John Doe" className="mt-1" />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md text-sm">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-gray-500 mr-2" />
                <p>Your card will only be authorized today. The payment will be processed after the service is completed.</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-dwellin-sky hover:bg-opacity-90" 
                onClick={handlePaymentCompletion}
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default BookingPage;
