
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CreditsDisplayProps {
  availableCredits: number;
}

const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ availableCredits }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Available Credits</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">${availableCredits.toFixed(2)}</p>
        <p className="text-sm text-gray-500 mt-1">
          These credits can be applied to your future bookings.
        </p>
      </CardContent>
    </Card>
  );
};

export default CreditsDisplay;
