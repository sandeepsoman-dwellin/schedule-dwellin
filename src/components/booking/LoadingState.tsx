
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading service details..." 
}) => {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
      <h2 className="text-2xl font-bold">{message}</h2>
    </div>
  );
};

export default LoadingState;
