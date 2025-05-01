
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBookings } from '@/hooks/bookings/useBookings';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import LoadingState from '@/components/booking/LoadingState';
import ErrorState from '@/components/booking/ErrorState';
import PhoneVerification from '@/components/booking/PhoneVerification';
import RescheduleDialog from '@/components/booking/RescheduleDialog';
import CancelBookingDialog from '@/components/booking/CancelBookingDialog';
import BookingsList from '@/components/booking/BookingsList';
import CreditsDisplay from '@/components/booking/CreditsDisplay';
import { rescheduleBooking, cancelBooking, getAvailableTimeSlots } from '@/hooks/bookings/bookingApi';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Booking } from '@/hooks/bookings/useBookings';

const BookingsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const { data, isLoading, error, refetch } = useBookings();
  
  // Available credits (in a real app, this would be fetched from the API)
  const [availableCredits] = useState<number>(25.00);
  
  // Reschedule and cancel state
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  
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
  
  // Handle reschedule
  const handleReschedule = (booking: Booking) => {
    setSelectedBooking(booking);
    // Fetch available time slots for the selected date
    const fetchTimeSlots = async () => {
      const slots = await getAvailableTimeSlots(new Date(booking.booking_date));
      setAvailableTimeSlots(slots);
    };
    fetchTimeSlots();
    setIsRescheduleDialogOpen(true);
  };
  
  const handleRescheduleConfirm = async (bookingId: string, date: Date, timeSlot: string) => {
    const success = await rescheduleBooking(bookingId, date, timeSlot);
    if (success) {
      refetch();
    }
  };
  
  // Handle cancel
  const handleCancel = (bookingId: string) => {
    setCancelBookingId(bookingId);
    setIsCancelDialogOpen(true);
  };
  
  const handleCancelConfirm = async (bookingId: string) => {
    const success = await cancelBooking(bookingId);
    if (success) {
      refetch();
    }
  };
  
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
  
  // Separate upcoming and past bookings
  const currentDate = new Date();
  const upcomingBookings = filteredBookings.filter(booking => {
    const bookingDate = new Date(booking.booking_date);
    return bookingDate >= currentDate || (
      bookingDate.getDate() === currentDate.getDate() && 
      bookingDate.getMonth() === currentDate.getMonth() && 
      bookingDate.getFullYear() === currentDate.getFullYear()
    );
  });
  
  const pastBookings = filteredBookings.filter(booking => {
    const bookingDate = new Date(booking.booking_date);
    return bookingDate < currentDate && !(
      bookingDate.getDate() === currentDate.getDate() && 
      bookingDate.getMonth() === currentDate.getMonth() && 
      bookingDate.getFullYear() === currentDate.getFullYear()
    );
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Bookings</h1>
        <Link to="/services">
          <Button>Book New Service</Button>
        </Link>
      </div>
      
      {/* Credits Display */}
      <div className="mb-8">
        <CreditsDisplay availableCredits={availableCredits} />
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
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
            <TabsTrigger value="history">Booking History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
            <BookingsList 
              bookings={upcomingBookings}
              onReschedule={handleReschedule}
              onCancel={handleCancel}
            />
          </TabsContent>
          
          <TabsContent value="history">
            <h2 className="text-xl font-semibold mb-4">Booking History</h2>
            <BookingsList 
              bookings={pastBookings}
              onReschedule={handleReschedule}
              onCancel={handleCancel}
              isPastBookings={true}
            />
          </TabsContent>
        </Tabs>
      )}
      
      {/* Reschedule Dialog */}
      <RescheduleDialog 
        isOpen={isRescheduleDialogOpen}
        onClose={() => setIsRescheduleDialogOpen(false)}
        booking={selectedBooking}
        onReschedule={handleRescheduleConfirm}
        availableTimeSlots={availableTimeSlots}
      />
      
      {/* Cancel Dialog */}
      <CancelBookingDialog 
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleCancelConfirm}
        bookingId={cancelBookingId}
      />
    </div>
  );
};

export default BookingsDashboard;
