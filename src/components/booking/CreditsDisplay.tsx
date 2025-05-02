
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

interface CreditsDisplayProps {
  availableCredits: number;
}

const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ availableCredits }) => {
  // Mock expiration date - in a real app this would come from the API
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() + 6); // Credits expire in 6 months
  
  const formattedExpirationDate = new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(expirationDate);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-dwellin-sky" />
          Available Credits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <p className="text-2xl font-bold text-dwellin-navy">${availableCredits.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">
              These credits can be applied to your future bookings.
            </p>
          </div>
          <div className="mt-2 md:mt-0 md:text-right">
            <p className="text-sm font-medium">Expires on</p>
            <p className="text-sm text-gray-500">{formattedExpirationDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditsDisplay;
