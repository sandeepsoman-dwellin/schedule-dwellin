
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Booking } from '@/hooks/bookings/useBookings';
import { TIME_SLOTS } from '@/hooks/bookings/bookingApi';

interface RescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onReschedule: (bookingId: string, date: Date, timeSlot: string) => Promise<void>;
  availableTimeSlots: string[];
}

const RescheduleDialog: React.FC<RescheduleDialogProps> = ({
  isOpen,
  onClose,
  booking,
  onReschedule,
  availableTimeSlots,
}) => {
  const [date, setDate] = useState<Date | undefined>(
    booking ? new Date(booking.booking_date) : undefined
  );
  const [timeSlot, setTimeSlot] = useState<string>(booking?.time_slot || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset the values when the dialog opens with a new booking
  useEffect(() => {
    if (booking) {
      setDate(new Date(booking.booking_date));
      setTimeSlot(booking.time_slot);
      console.log('Dialog opened with booking:', booking);
    }
  }, [booking, isOpen]);
  
  const handleSubmit = async () => {
    if (!booking || !date || !timeSlot) {
      console.error('Missing data for reschedule:', { booking, date, timeSlot });
      return;
    }
    
    console.log('Submitting reschedule with:', { id: booking.id, date, timeSlot });
    setIsSubmitting(true);
    
    try {
      await onReschedule(booking.id, date, timeSlot);
    } catch (error) {
      console.error('Failed to reschedule booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Use TIME_SLOTS as fallback and ensure we always have a consistent set of time slots
  const displayTimeSlots = availableTimeSlots.length > 0 ? 
    // Ensure we're using only valid time slots from our constant list
    availableTimeSlots.filter(slot => TIME_SLOTS.includes(slot)) : 
    TIME_SLOTS;
    
  console.log('Available time slots for reschedule:', displayTimeSlots);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new date and time for your appointment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="date" className="text-sm font-medium">
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? (
                    format(date, "PPP")
                  ) : (
                    <span>Select date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="time" className="text-sm font-medium">
              Time Slot
            </label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger id="time">
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {displayTimeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!date || !timeSlot || isSubmitting}
          >
            {isSubmitting ? 'Rescheduling...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleDialog;
