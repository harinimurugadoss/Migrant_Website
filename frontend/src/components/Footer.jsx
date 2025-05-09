import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">TN Migrant Worker Portal</h3>
            <p className="text-gray-300 mb-4">
              A comprehensive platform to address migrant labor issues in Tamil Nadu,
              providing resources, support, and management tools.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition duration-200">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-200">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-200">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-200">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition duration-200">Home</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition duration-200">Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white transition duration-200">Register</Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-200">About Us</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-200">Contact</a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-200">Worker Rights</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-200">Labor Laws</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-200">Health Services</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-200">Education</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-200">Housing</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Contact Us</h3>
            <address className="not-italic text-gray-300">
              <p className="mb-2">
                <i className="fas fa-map-marker-alt mr-2"></i>
                123 Government Complex, Chennai, Tamil Nadu, India
              </p>
              <p className="mb-2">
                <i className="fas fa-phone-alt mr-2"></i>
                +91 1234567890
              </p>
              <p className="mb-2">
                <i className="fas fa-envelope mr-2"></i>
                support@tnmigrantportal.gov.in
              </p>
              <p>
                <i className="fas fa-clock mr-2"></i>
                Monday-Friday: 9am-5pm
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>
            &copy; {currentYear} Tamil Nadu Migrant Worker Portal. All rights reserved. | Government of Tamil Nadu
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
