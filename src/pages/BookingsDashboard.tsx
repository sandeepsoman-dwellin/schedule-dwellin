
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBookings } from '@/hooks/bookings/useBookings';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import LoadingState from '@/components/booking/LoadingState';
import ErrorState from '@/components/booking/ErrorState';
import PhoneVerification from '@/components/booking/PhoneVerification';

const BookingsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const { data, isLoading, error } = useBookings();
  
  // Check for verified phone on mount
  useEffect(() => {
    const verifiedPhone = localStorage.getItem("verifiedPhone");
    if (verifiedPhone) {
      setIsVerified(true);
    } else {
      // If no verified phone, show verification dialog
      setIsVerificationOpen(true);
    }
  }, []);
  
  const handleVerificationComplete = (phone: string) => {
    localStorage.setItem("verifiedPhone", phone);
    setIsVerified(true);
    setIsVerificationOpen(false);
  };
  
  // If not verified and dialog is closed, redirect to home
  useEffect(() => {
    if (!isVerified && !isVerificationOpen) {
      navigate('/');
    }
  }, [isVerified, isVerificationOpen, navigate]);
  
  if (!isVerified) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PhoneVerification
          isOpen={isVerificationOpen}
          onOpenChange={(open) => {
            setIsVerificationOpen(open);
            if (!open && !isVerified) {
              navigate('/');
            }
          }}
          onVerificationComplete={handleVerificationComplete}
        />
        <LoadingState message="Verifying your identity..." />
      </div>
    );
  }
  
  if (isLoading) {
    return <LoadingState message="Loading bookings..." />;
  }
  
  if (error || !data) {
    return <ErrorState 
      title="Error Loading Bookings" 
      message="We encountered an issue while loading your bookings. Please try again later."
    />;
  }
  
  const bookings = data;
  const verifiedPhone = localStorage.getItem("verifiedPhone");
  
  // Filter bookings by the verified phone number if it exists
  const filteredBookings = verifiedPhone 
    ? bookings.filter(booking => booking.customer_phone === verifiedPhone)
    : bookings;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Bookings</h1>
        <Link to="/services">
          <Button>Book New Service</Button>
        </Link>
      </div>
      
      {filteredBookings.length === 0 ? (
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No bookings found</h2>
          <p className="mb-4">You haven't made any bookings yet for this phone number.</p>
          <Link to="/services">
            <Button>Browse Services</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookings.map((booking) => (
            <Link to={`/bookings/${booking.id}`} key={booking.id}>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-2">
                  {booking.service?.name || "Service"}
                </h3>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Date:</span> {format(new Date(booking.booking_date), 'PPP')}
                </p>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Time:</span> {booking.time_slot}
                </p>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-1 ${
                    booking.status === 'confirmed' ? 'text-green-600' : 
                    booking.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-4">
                  Booking ID: {booking.id}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsDashboard;
