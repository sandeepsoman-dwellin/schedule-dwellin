
import React from 'react';
import { Check, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Service } from '@/hooks/services/types';
import { BookingFormValues } from './BookingForm';

interface OrderSummaryProps {
  service: Service;
  onPayClick: () => void;
  isPaymentProcessing: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ service, onPayClick, isPaymentProcessing }) => {
  return (
    <div className="sticky top-8">
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>{service.name}</span>
            <span>${service.base_price}</span>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${service.base_price}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Fixed price, no hidden fees
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button 
            onClick={onPayClick}
            className="w-full bg-dwellin-sky hover:bg-opacity-90 text-white py-6 mb-4"
            disabled={isPaymentProcessing}
          >
            {isPaymentProcessing ? (
              <>
                <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Pay Now
              </>
            )}
          </Button>
          
          {/* Trust Building Elements */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-md text-sm">
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <p>Your card is only authorized today. Payment is processed after the service is completed.</p>
            </div>
            
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <p>All services include our 60-day Satisfaction Guarantee</p>
            </div>
            
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <p>Vetted, background-checked professionals</p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderSummary;
