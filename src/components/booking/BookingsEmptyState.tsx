
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BookingsEmptyStateProps {
  message?: string;
}

const BookingsEmptyState: React.FC<BookingsEmptyStateProps> = ({ 
  message = "You haven't made any bookings yet for this phone number."
}) => {
  // Get the verified phone from localStorage
  const verifiedPhone = localStorage.getItem("verifiedPhone");
  
  return (
    <Card className="p-8 text-center">
      <h2 className="text-xl font-semibold mb-4">No bookings found</h2>
      <p className="mb-4">
        {verifiedPhone 
          ? `No bookings found for ${verifiedPhone}. Browse our services to make your first booking.` 
          : message}
      </p>
      <Link to="/services">
        <Button>Browse Services</Button>
      </Link>
    </Card>
  );
};

export default BookingsEmptyState;
