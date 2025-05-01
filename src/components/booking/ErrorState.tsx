
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ErrorState: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h2 className="text-2xl font-bold mb-4">Service Not Found</h2>
      <p className="mb-6">We couldn't find the service you're looking for.</p>
      <Link to="/services">
        <Button>Return to Services</Button>
      </Link>
    </div>
  );
};

export default ErrorState;
