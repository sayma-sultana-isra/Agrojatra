import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  Briefcase,
  FileText,
  Brain,
  BookOpen,
  Mic,
  Users,
  Wrench,
  Bell,
  HelpCircle,
  PlusCircle,
  List,
  Search,
  BarChart3,
  Calendar,
  MessageSquare,
  Share2,
  Settings,
  Shield,
  UserCheck,
  Target,
  MapPin,
  Rocket,
  Lightbulb,
  CalendarDays,
  Heart,
  Upload,
  UserPlus,
  Home,
  Radio,
  Building
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'student':
        return [
          { icon: MessageSquare, label: 'Feed', path: '/dashboard' },
          { icon: User, label: 'My Profile', path: '/profile' },
          { icon: UserPlus, label: 'Network', path: '/network' },
          { icon: Briefcase, label: 'Job Search', path: '/jobs/search' },
          { icon: FileText, label: 'My Applications', path: '/applications' },
          { icon: Building, label: 'Company Applications', path: '/company-applications' },
          { icon: CalendarDays, label: 'Events', path: '/events' },
          { icon: Building, label: 'Companies', path: '/companies' },
          
          { icon: MapPin, label: 'Career Roadmap', path: '/roadmap' },
          
          
          
          { icon: Bell, label: 'Notifications', path: '/notifications' },
          
        ];

      case 'employer':
        return [
          { icon: MessageSquare, label: 'Feed', path: '/dashboard' },
          
          
          { icon: PlusCircle, label: 'Post a Job', path: '/jobs/create' },
          { icon: List, label: 'My Job Listings', path: '/jobs/manage' },
          { icon: Users, label: 'Applicants', path: '/applications/manage' },
          { icon: CalendarDays, label: 'Events', path: '/events' },
          { icon: Building, label: 'My Companies', path: '/companies/manage' },
          { icon: Users, label: 'Company Applications', path: '/companies/applications' },
          { icon: Search, label: 'Browse Companies', path: '/companies' },
          
          
          
          { icon: Bell, label: 'Notifications', path: '/notifications' }
         
        ];

      case 'alumni':
        return [
          { icon: MessageSquare, label: 'Feed', path: '/dashboard' },
          { icon: User, label: 'My Profile', path: '/profile' },
          
          { icon: CalendarDays, label: 'Events & Meetups', path: '/events' },
          { icon: Building, label: 'Companies', path: '/companies' },
          
          
          
          { icon: Bell, label: 'Notifications', path: '/notifications' }
          
        ];

      case 'admin':
        return [
          { icon: Home, label: 'Dashboard', path: '/dashboard' },
          { icon: Users, label: 'Manage Users', path: '/admin/users' },
          { icon: Briefcase, label: 'Manage Jobs', path: '/admin/jobs' },
          { icon: Target, label: 'Career Roadmaps', path: '/admin/roadmaps' }
          
          
          
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">JobPortal</h2>
            <p className="text-xs text-gray-500 capitalize">{user?.role} Panel</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;