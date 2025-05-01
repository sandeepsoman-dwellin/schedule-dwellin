
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  buttonText?: string;
  buttonLink?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Service Not Found",
  message = "We couldn't find the service you're looking for.",
  buttonText = "Return to Services",
  buttonLink = "/services"
}) => {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="mb-6">{message}</p>
      <Link to={buttonLink}>
        <Button>{buttonText}</Button>
      </Link>
    </div>
  );
};

export default ErrorState;
