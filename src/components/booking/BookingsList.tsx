
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Booking } from '@/hooks/bookings/useBookings';
import { Calendar, Clock } from 'lucide-react';

interface BookingsListProps {
  bookings: Booking[];
  onReschedule: (booking: Booking) => void;
  onCancel: (bookingId: string) => void;
  isPastBookings?: boolean;
}

const BookingsList: React.FC<BookingsListProps> = ({ 
  bookings, 
  onReschedule, 
  onCancel, 
  isPastBookings = false 
}) => {
  if (bookings.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600">
          {isPastBookings 
            ? "You don't have any past appointments." 
            : "You don't have any upcoming appointments."}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between">
              <div>
                <h3 className="font-medium text-lg mb-2">
                  {booking.service?.name || "Unknown Service"}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(booking.booking_date), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{booking.time_slot}</span>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex flex-col items-end gap-2">
                <div className="text-lg font-semibold">${booking.payment_amount}</div>
                <div className="capitalize px-2 py-0.5 rounded-full text-xs font-medium bg-opacity-10"
                  style={{
                    backgroundColor: booking.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : 
                                     booking.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: booking.status === 'confirmed' ? 'rgb(16, 185, 129)' : 
                           booking.status === 'cancelled' ? 'rgb(239, 68, 68)' : 'rgb(245, 158, 11)'
                  }}
                >
                  {booking.status}
                </div>
              </div>
            </div>

            {!isPastBookings && booking.status !== 'cancelled' && (
              <div className="mt-4 pt-3 border-t flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  className="sm:ml-auto"
                  onClick={() => onReschedule(booking)}
                >
                  Reschedule
                </Button>
                <Button 
                  variant="outline" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => onCancel(booking.id)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BookingsList;
