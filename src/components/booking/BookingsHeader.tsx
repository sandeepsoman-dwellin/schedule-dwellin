
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface BookingsHeaderProps {
  title: string;
}

const BookingsHeader: React.FC<BookingsHeaderProps> = ({ title }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      <Link to="/services">
        <Button>Book New Service</Button>
      </Link>
    </div>
  );
};

export default BookingsHeader;
