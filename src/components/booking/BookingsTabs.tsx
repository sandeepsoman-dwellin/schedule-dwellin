
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock } from 'lucide-react';
import { Booking } from '@/hooks/bookings/useBookings';
import BookingsList from './BookingsList';

interface BookingsTabsProps {
  upcomingBookings: Booking[];
  pastBookings: Booking[];
  onReschedule: (booking: Booking) => void;
  onCancel: (bookingId: string) => void;
}

const BookingsTabs: React.FC<BookingsTabsProps> = ({ 
  upcomingBookings, 
  pastBookings, 
  onReschedule, 
  onCancel 
}) => {
  console.log('BookingsTabs: Rendering with upcoming bookings count:', upcomingBookings.length);
  console.log('BookingsTabs: Rendering with past bookings count:', pastBookings.length);
  
  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="upcoming" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Upcoming Appointments ({upcomingBookings.length})
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Booking History ({pastBookings.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upcoming">
        <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
        <BookingsList 
          bookings={upcomingBookings}
          onReschedule={onReschedule}
          onCancel={onCancel}
        />
      </TabsContent>
      
      <TabsContent value="history">
        <h2 className="text-xl font-semibold mb-4">Booking History</h2>
        <BookingsList 
          bookings={pastBookings}
          onReschedule={onReschedule}
          onCancel={onCancel}
          isPastBookings={true}
        />
      </TabsContent>
    </Tabs>
  );
};

export default BookingsTabs;
