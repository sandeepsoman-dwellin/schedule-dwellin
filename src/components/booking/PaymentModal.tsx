
import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PaymentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentComplete: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onOpenChange, onPaymentComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePaymentConfirm = () => {
    setIsLoading(true);
    // Simulate a slight delay for UX purposes
    setTimeout(() => {
      onPaymentComplete();
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isLoading) onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Enter Payment Information</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Mock Credit Card Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">Card Number</label>
              <Input id="card-number" placeholder="1234 5678 9012 3456" className="mt-1" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiration" className="block text-sm font-medium text-gray-700">Expiration</label>
                <Input id="expiration" placeholder="MM / YY" className="mt-1" />
              </div>
              <div>
                <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">CVC</label>
                <Input id="cvc" placeholder="123" className="mt-1" />
              </div>
            </div>
            
            <div>
              <label htmlFor="card-name" className="block text-sm font-medium text-gray-700">Name on Card</label>
              <Input id="card-name" placeholder="John Doe" className="mt-1" />
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md text-sm">
            <div className="flex items-center">
              <Info className="h-5 w-5 text-gray-500 mr-2" />
              <p>Your card will only be authorized today. The payment will be processed after the service is completed.</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              className="bg-dwellin-sky hover:bg-opacity-90" 
              onClick={handlePaymentConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                'Confirm Payment'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
