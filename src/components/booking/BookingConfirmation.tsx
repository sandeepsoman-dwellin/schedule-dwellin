
import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Service } from '@/hooks/services/types';

interface BookingConfirmationProps {
  service: Service;
  bookingId: string | null;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ service, bookingId }) => {
  return (
    <Card className="p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-green-100 p-3">
          <Check className="h-8 w-8 text-green-600" />
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-4">Thank You For Your Booking!</h1>
      <p className="mb-6 text-lg">
        Your {service.name} service has been scheduled. You will receive a confirmation email shortly.
      </p>
      <p className="mb-2 text-gray-600">
        A professional will contact you before the scheduled date to confirm the details.
      </p>
      {bookingId && (
        <p className="mb-6 text-sm text-gray-500">
          Booking Reference: {bookingId}
        </p>
      )}
      <Link to="/">
        <Button className="bg-dwellin-sky hover:bg-opacity-90">Return to Home</Button>
      </Link>
    </Card>
  );
};

export default BookingConfirmation;
