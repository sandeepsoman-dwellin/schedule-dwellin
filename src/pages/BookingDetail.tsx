
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBookingDetail } from '@/hooks/bookings/useBookings';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, MapPin, Phone, Mail, FileText, Loader2 } from 'lucide-react';

const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { booking, isLoading, error } = useBookingDetail(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold">Loading booking details...</h2>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
        <p className="mb-6">We couldn't find the booking you're looking for.</p>
        <Link to="/bookings">
          <Button>Return to Bookings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/bookings" className="flex items-center text-primary mb-6 hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to All Bookings
      </Link>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Booking Details</CardTitle>
              <CardDescription>
                Booking #{booking.id.substring(0, 8)}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Service Information</h3>
                  <div className="space-y-3">
                    <p className="font-medium text-xl">{booking.service?.name || 'Unknown Service'}</p>
                    <p className="text-gray-500">{booking.service?.description || 'No description available'}</p>
                    
                    <div className="flex items-center mt-2">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{format(new Date(booking.booking_date), 'MMM dd, yyyy')}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{booking.time_slot}</span>
                    </div>
                    
                    {booking.zip_code && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Service Area: {booking.zip_code}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <p className="font-medium">{booking.customer_name}</p>
                    
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{booking.customer_phone}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{booking.customer_email}</span>
                    </div>
                    
                    {booking.special_instructions && (
                      <div>
                        <div className="flex items-center mt-2">
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium">Special Instructions:</span>
                        </div>
                        <p className="pl-6 text-gray-600">{booking.special_instructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Status Information</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 flex-1">
                    <p className="text-sm text-gray-500">Booking Status</p>
                    <p className={`font-medium ${
                      booking.status === 'confirmed' ? 'text-green-600' : 
                      booking.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 flex-1">
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className={`font-medium ${
                      booking.payment_status === 'paid' ? 'text-green-600' : 
                      booking.payment_status === 'authorized' ? 'text-blue-600' : 
                      booking.payment_status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 flex-1">
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium">${booking.payment_amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline">Contact Support</Button>
              <Button variant="destructive">Cancel Booking</Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right sidebar - could include add-on services or related info */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                We're here to assist you with your booking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                If you need to modify your booking or have any questions, please contact our customer support team.
              </p>
              <p className="text-sm font-medium">
                Phone: (555) 123-4567
              </p>
              <p className="text-sm">
                Email: support@dwellin.com
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Contact Support</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
