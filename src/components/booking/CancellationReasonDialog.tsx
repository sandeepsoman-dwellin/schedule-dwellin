
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface CancellationReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingId: string, reason: string) => Promise<void>;
  bookingId: string | null;
}

const CancellationReasonDialog: React.FC<CancellationReasonDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  bookingId,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleConfirm = async () => {
    if (!bookingId) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(bookingId, reason);
      onClose();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Please share the reason you're cancelling this appointment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Alert>
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Your credit card authorization will be dropped when you cancel.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4">
            <Textarea
              placeholder="Please tell us why you're cancelling this appointment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Go Back
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isSubmitting || reason.trim() === ''}
            variant="destructive"
          >
            {isSubmitting ? 'Cancelling...' : 'Cancel Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancellationReasonDialog;
