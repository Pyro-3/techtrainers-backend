import React from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  Users,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
  Shield,
  Book,
  HelpCircle
} from 'lucide-react';

const TrainerFooter: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-cyan-900/10" />
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Section */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  TechTrainers
                </h3>
                <p className="text-xs text-slate-400">Trainer Portal</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Empowering certified trainers to deliver exceptional fitness experiences 
              and build lasting relationships with their clients.
            </p>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Certified Trainer Platform</span>
            </div>
          </div>

          {/* Trainer Tools */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Trainer Tools</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/trainer/dashboard" 
                  className="flex items-center space-x-2 text-slate-400 hover:text-purple-400 transition-colors group"
                >
                  <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Client Dashboard</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/trainer/workout-creator" 
                  className="flex items-center space-x-2 text-slate-400 hover:text-purple-400 transition-colors group"
                >
                  <Dumbbell className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Workout Creator</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/trainer/bookings" 
                  className="flex items-center space-x-2 text-slate-400 hover:text-purple-400 transition-colors group"
                >
                  <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Booking Management</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/trainer/reports" 
                  className="flex items-center space-x-2 text-slate-400 hover:text-purple-400 transition-colors group"
                >
                  <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Progress Reports</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Support & Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/trainer/help" 
                  className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors group"
                >
                  <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Help Center</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/trainer/training-materials" 
                  className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors group"
                >
                  <Book className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Training Materials</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/trainer/policies" 
                  className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors group"
                >
                  <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Trainer Policies</span>
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:trainers@techtrainers.ca" 
                  className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors group"
                >
                  <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Contact Support</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">Trainer Support</p>
                  <p className="text-slate-400 text-sm">trainers@techtrainers.ca</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">Support Line</p>
                  <p className="text-slate-400 text-sm">1-800-TRAINER</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">Headquarters</p>
                  <p className="text-slate-400 text-sm">Toronto, ON, Canada</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-slate-400 text-sm">
              © 2025 TechTrainers Trainer Portal. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                to="/trainer/privacy" 
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/trainer/terms" 
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                to="/trainer/code-of-conduct" 
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Code of Conduct
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default TrainerFooter;
