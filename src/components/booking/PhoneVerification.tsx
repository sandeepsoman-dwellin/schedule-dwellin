
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
    setTimeout(() => {
      console.log("Verification code sent to phone:", phone);
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
        console.log("Phone verification successful:", phone);
        toast.success("Phone verified successfully!");
        
        // Store the verified phone in localStorage
        localStorage.setItem("verifiedPhone", phone);
        
        // Call the completion handler to notify parent components
        onVerificationComplete(phone);
        
        // Reset the form state for next use
        setPhone("");
        setVerificationCode("");
        setCodeSent(false);
        
        // Close the dialog AFTER verification is complete
        setTimeout(() => {
          onOpenChange(false);
        }, 100);
      } else {
        toast.error("Invalid verification code");
        setIsSubmitting(false);
      }
    }, 1000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {codeSent ? "Enter Verification Code" : "Enter Your Phone Number"}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            {codeSent 
              ? "We've sent a verification code to your phone. Please enter it below."
              : "Enter the phone number you used for booking to access your bookings"
            }
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {!codeSent ? (
            <>
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
