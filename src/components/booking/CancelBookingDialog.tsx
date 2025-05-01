
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CancelBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingId: string) => Promise<void>;
  bookingId: string | null;
}

const CancelBookingDialog: React.FC<CancelBookingDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  bookingId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleConfirm = async () => {
    if (!bookingId) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(bookingId);
      onClose();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will cancel your scheduled appointment. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isSubmitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSubmitting ? 'Processing...' : 'Yes, cancel appointment'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelBookingDialog;
