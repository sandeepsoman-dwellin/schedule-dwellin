
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
  return (
    <Card className="p-8 text-center">
      <h2 className="text-xl font-semibold mb-4">No bookings found</h2>
      <p className="mb-4">{message}</p>
      <Link to="/services">
        <Button>Browse Services</Button>
      </Link>
    </Card>
  );
};

export default BookingsEmptyState;
