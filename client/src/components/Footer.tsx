// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between gap-4">
        {/* Navigate Column */}
        <div className="flex-1">
          <h4 className="text-white font-semibold mb-4">Navigate</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/dashboard" className="hover:text-white">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/fitness" className="hover:text-white">
                Progress Tracking
              </Link>
            </li>
            <li>
              <Link to="/beginner" className="hover:text-white">
                Beginner
              </Link>
            </li>
            <li>
              <Link to="/intermediate" className="hover:text-white">
                Intermediate
              </Link>
            </li>
            <li>
              <Link to="/advanced" className="hover:text-white">
                Advanced
              </Link>
            </li>
          
          </ul>
        </div>

        {/* Support Column */}
        <div className="flex-1">
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/about" className="hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/support" className="hover:text-white">
                Support &amp; Resources
              </Link>
            </li>
            <li>
              <a href="/TechTrainers_User_Manual.pdf" target="_blank" rel="noopener" className="hover:text-white">
                Download User Manual
              </a>
            </li>
            <li>
              <a href="mailto:support@techtrainers.ca" className="hover:text-white">
                support@techtrainers.ca
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 border-t border-stone-700 pt-4 text-center text-sm text-stone-500">
        &copy; {new Date().getFullYear()} TechTrainers. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
