
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBookingDetail } from '@/hooks/bookings/useBookings';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft } from 'lucide-react';
import LoadingState from '@/components/booking/LoadingState';
import ErrorState from '@/components/booking/ErrorState';

const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useBookingDetail(id);
  
  if (isLoading) {
    return <LoadingState message="Loading booking details..." />;
  }
  
  if (error || !data) {
    return <ErrorState 
      title="Booking Not Found" 
      message="We couldn't find the booking you're looking for."
      buttonText="Return to Bookings"
      buttonLink="/bookings"
    />;
  }
  
  const booking = data;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/bookings" className="inline-flex items-center mb-6 text-primary hover:text-primary/80">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Bookings
      </Link>
      
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Booking Reference</p>
              <CardTitle>{booking.id}</CardTitle>
            </div>
            <div className="px-3 py-1 rounded-full text-sm font-medium capitalize 
              ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
              'bg-yellow-100 text-yellow-800'}">
              {booking.status}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Service Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="font-medium">{booking.service?.name || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{format(new Date(booking.booking_date), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">{booking.time_slot}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{booking.zip_code || "Not specified"}</p>
                </div>
                {booking.special_instructions && (
                  <div>
                    <p className="text-sm text-gray-500">Special Instructions</p>
                    <p>{booking.special_instructions}</p>
                  </div>
                )}
              </div>
              
              <Separator className="my-6" />
              
              <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">${booking.payment_amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-medium capitalize ${
                    booking.payment_status === 'paid' ? 'text-green-600' : 
                    booking.payment_status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {booking.payment_status}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{booking.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{booking.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{booking.customer_phone}</p>
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                <Button className="w-full" variant="outline">
                  Need Help?
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingDetail;
