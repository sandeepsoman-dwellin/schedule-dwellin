
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-dwellin-navy text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">dwellin</h3>
            <p className="text-gray-400">
              Making home services simple, reliable, and hassle-free.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-gray-400 hover:text-white">Gutter Cleaning</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white">Pressure Washing</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white">Window Cleaning</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white">View All</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white">How It Works</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white">For Pros</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">Help Center</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Dwellin Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
