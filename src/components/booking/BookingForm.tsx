
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, isWeekend, addDays } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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

// Time slots available for booking
export const TIME_SLOTS = [
  { id: "morning", label: "Morning (8AM - 12PM)", value: "8AM - 12PM" },
  { id: "afternoon", label: "Afternoon (12PM - 4PM)", value: "12PM - 4PM" },
  { id: "evening", label: "Evening (4PM - 8PM)", value: "4PM - 8PM" },
];

// Define form schema using zod
export const bookingFormSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone number is required" }),
  date: z.date({ required_error: "Please select a date" }),
  timeSlot: z.string({ required_error: "Please select a time slot" }),
  notes: z.string().optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  onSubmit: (values: BookingFormValues) => void;
  isPaymentProcessing: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, isPaymentProcessing }) => {
  // State to control the date picker popover
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
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

  return (
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
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(date);
                          // Close calendar after selection
                          setIsCalendarOpen(false);
                        }
                      }}
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
  );
};

export default BookingForm;
