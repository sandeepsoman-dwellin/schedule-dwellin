import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import PhoneVerification from "@/components/booking/PhoneVerification";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleVerificationComplete = (phone: string) => {
    console.log("Verification complete in Navbar, navigating to bookings page");
    
    // Close the verification dialog FIRST (important for order of operations)
    setIsVerificationOpen(false);
    
    // Then navigate - using setTimeout to ensure state updates have completed
    // This helps avoid any race conditions between state updates and navigation
    setTimeout(() => {
      // Force a hard navigation to the bookings page to ensure clean state
      navigate("/bookings", { replace: true });
    }, 10);
  };
  
  return (
    <header className="py-6 border-b border-gray-100 bg-white">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <a 
          href="https://www.dwellin.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <img 
            src="/lovable-uploads/b31443ae-54c7-4126-9e5a-4f8fb43a0983.png" 
            alt="Dwellin Logo" 
            className="h-8 md:h-10"
          />
        </a>
        
        {/* Desktop menu */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/services" className="text-gray-600 hover:text-dwellin-navy">Services</Link>
          <Link to="/" className="text-gray-600 hover:text-dwellin-navy">How It Works</Link>
          <Button 
            variant="ghost"
            className="text-gray-600 hover:text-dwellin-navy"
            onClick={() => {
              // Check if user is already verified before showing dialog
              const verifiedPhone = localStorage.getItem("verifiedPhone");
              if (verifiedPhone) {
                // If already verified, navigate directly
                navigate("/bookings", { replace: true });
              } else {
                // Otherwise, show verification dialog
                setIsVerificationOpen(true);
              }
            }}
          >
            My Bookings
          </Button>
          <Button className="bg-dwellin-sky hover:bg-opacity-90 text-white">Get Started</Button>
        </nav>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden py-4 px-4 bg-white shadow-md animate-fade-in">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/services" 
              className="py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link 
              to="/" 
              className="py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <button 
              className="py-2 px-4 text-left text-gray-600 hover:bg-gray-100 rounded-md"
              onClick={() => {
                setIsMenuOpen(false);
                // Check if user is already verified before showing dialog
                const verifiedPhone = localStorage.getItem("verifiedPhone");
                if (verifiedPhone) {
                  // If already verified, navigate directly
                  navigate("/bookings", { replace: true });
                } else {
                  // Otherwise, show verification dialog
                  setIsVerificationOpen(true);
                }
              }}
            >
              My Bookings
            </button>
            <Link to="/">
              <Button 
                className="w-full bg-dwellin-sky hover:bg-opacity-90 text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      )}
      
      {/* Phone verification dialog */}
      <PhoneVerification 
        isOpen={isVerificationOpen}
        onOpenChange={setIsVerificationOpen}
        onVerificationComplete={handleVerificationComplete}
      />
    </header>
  );
};

export default Navbar;
