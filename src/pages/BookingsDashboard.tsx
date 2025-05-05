
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingsByPhone } from '@/hooks/bookings/useBookings';
import LoadingState from '@/components/booking/LoadingState';
import ErrorState from '@/components/booking/ErrorState';
import PhoneVerification from '@/components/booking/PhoneVerification';
import RescheduleDialog from '@/components/booking/RescheduleDialog';
import CancellationReasonDialog from '@/components/booking/CancellationReasonDialog';
import BookingsHeader from '@/components/booking/BookingsHeader';
import BookingsEmptyState from '@/components/booking/BookingsEmptyState';
import BookingsTabs from '@/components/booking/BookingsTabs';
import CreditsDisplay from '@/components/booking/CreditsDisplay';
import { rescheduleBooking, cancelBooking, getAvailableTimeSlots } from '@/hooks/bookings/bookingApi';
import { Booking } from '@/hooks/bookings/useBookings';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useFilteredBookings } from '@/hooks/bookings/useFilteredBookings';
import { toast } from 'sonner';

const BookingsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  
  // Available credits (in a real app, this would be fetched from the API)
  const [availableCredits] = useState<number>(25.00);
  
  // Reschedule and cancel state
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isCancellationReasonDialogOpen, setIsCancellationReasonDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  
  // Get the verified phone
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(
    localStorage.getItem("verifiedPhone")
  );
  
  console.log("BookingsDashboard: Initial verifiedPhone state:", verifiedPhone);
  
  // Use the new hook to fetch bookings by phone
  const { data: bookings, isLoading, error, refetch } = useBookingsByPhone(verifiedPhone);
  
  console.log("BookingsDashboard: Raw bookings data:", bookings);
  
  // Filter and segment bookings
  const { upcomingBookings, pastBookings } = useFilteredBookings(
    bookings || []
  );
  
  // Check for verification on mount
  useEffect(() => {
    console.log("BookingsDashboard: Checking for verified phone:", verifiedPhone);
    
    // Always show verification dialog when accessing the page
    if (!verifiedPhone) {
      console.log("BookingsDashboard: No verified phone, showing verification dialog");
      setIsVerificationOpen(true);
    }
  }, []);
  
  const handleVerificationComplete = (phone: string) => {
    console.log("BookingsDashboard: Verification completed with phone:", phone);
    setVerifiedPhone(phone);
    setIsVerificationOpen(false);
    refetch(); // Refresh the bookings data after verification
  };
  
  // Handle redirection when verification dialog is closed without verification
  const handleVerificationDialogChange = (open: boolean) => {
    setIsVerificationOpen(open);
    if (!open && !localStorage.getItem("verifiedPhone")) {
      console.log("BookingsDashboard: Verification dialog closed without verification, redirecting to home");
      navigate('/', { replace: true });
    }
  };
  
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
    try {
      const success = await rescheduleBooking(bookingId, date, timeSlot);
      if (success) {
        toast.success("Your appointment has been rescheduled and is pending confirmation.");
        refetch();
      }
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      toast.error('Failed to reschedule appointment');
    }
  };
  
  // Handle cancel
  const handleCancel = (bookingId: string) => {
    setCancelBookingId(bookingId);
    setIsCancellationReasonDialogOpen(true);
  };
  
  const handleCancelConfirm = async (bookingId: string, reason: string) => {
    try {
      const success = await cancelBooking(bookingId, reason);
      if (success) {
        toast.success("Your appointment has been cancelled and your credit card authorization has been dropped.");
        refetch();
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      toast.error('Failed to cancel appointment');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
          <LoadingState message="Loading bookings..." />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
          <ErrorState 
            title="Error Loading Bookings" 
            message="We encountered an issue while loading your bookings. Please try again later."
          />
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <BookingsHeader title="Your Bookings" />
          
          {/* Credits Display */}
          <div className="mb-8">
            <CreditsDisplay availableCredits={availableCredits} />
          </div>
          
          {upcomingBookings.length === 0 && pastBookings.length === 0 ? (
            <BookingsEmptyState />
          ) : (
            <BookingsTabs 
              upcomingBookings={upcomingBookings} 
              pastBookings={pastBookings} 
              onReschedule={handleReschedule}
              onCancel={handleCancel}
            />
          )}
          
          {/* Reschedule Dialog */}
          <RescheduleDialog 
            isOpen={isRescheduleDialogOpen}
            onClose={() => setIsRescheduleDialogOpen(false)}
            booking={selectedBooking}
            onReschedule={handleRescheduleConfirm}
            availableTimeSlots={availableTimeSlots}
          />
          
          {/* Cancellation Reason Dialog */}
          <CancellationReasonDialog 
            isOpen={isCancellationReasonDialogOpen}
            onClose={() => setIsCancellationReasonDialogOpen(false)}
            onConfirm={handleCancelConfirm}
            bookingId={cancelBookingId}
          />
          
          {/* Phone verification dialog */}
          <PhoneVerification
            isOpen={isVerificationOpen}
            onOpenChange={handleVerificationDialogChange}
            onVerificationComplete={handleVerificationComplete}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingsDashboard;
