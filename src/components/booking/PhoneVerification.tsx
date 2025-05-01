
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PhoneVerificationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onVerificationComplete: (phone: string) => void;
}

const PhoneVerification = ({ isOpen, onOpenChange, onVerificationComplete }: PhoneVerificationProps) => {
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSendCode = async () => {
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    setIsSubmitting(true);
    
    // Mock API call to send verification code
    // In a real implementation, this would call an API to send an SMS
    setTimeout(() => {
      toast.success("Verification code sent! For demo purposes, use 1234");
      setCodeSent(true);
      setIsSubmitting(false);
    }, 1000);
  };
  
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast.error("Please enter the verification code");
      return;
    }
    
    setIsSubmitting(true);
    
    // Mock verification - for demo purposes, accept "1234" as valid code
    setTimeout(() => {
      if (verificationCode === "1234") {
        toast.success("Phone verified successfully!");
        onVerificationComplete(phone);
        // Reset the form state for next use
        setPhone("");
        setVerificationCode("");
        setCodeSent(false);
      } else {
        toast.error("Invalid verification code");
      }
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {codeSent ? "Enter Verification Code" : "Enter Your Phone Number"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {!codeSent ? (
            <>
              <p className="text-center text-gray-600 mb-4">
                Enter the phone number you used for booking to access your bookings
              </p>
              <div className="space-y-4">
                <Input
                  type="tel"
                  placeholder="(123) 456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-base py-6"
                />
                <Button 
                  onClick={handleSendCode} 
                  className="w-full bg-dwellin-sky hover:bg-opacity-90 text-white py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Verification Code"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-center text-gray-600 mb-4">
                We've sent a verification code to your phone. Please enter it below.
              </p>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="text-base py-6"
                  maxLength={4}
                />
                <Button 
                  onClick={handleVerifyCode} 
                  className="w-full bg-dwellin-sky hover:bg-opacity-90 text-white py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verifying..." : "Verify Code"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneVerification;
