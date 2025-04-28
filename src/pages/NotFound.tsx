
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center bg-dwellin-light-gray">
        <div className="text-center px-4 py-20">
          <h1 className="text-6xl font-bold mb-4 text-dwellin-navy">404</h1>
          <p className="text-xl text-gray-600 mb-8">Oops! This page doesn't exist.</p>
          <Link to="/">
            <Button className="bg-dwellin-sky hover:bg-opacity-90 text-white">
              Return to Home
            </Button>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
