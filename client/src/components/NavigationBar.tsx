import React from 'react';
import { useLocation, Link } from 'wouter';
import { Home, BookOpen, BarChart2, User } from 'lucide-react';

export function NavigationBar() {
  const [location] = useLocation();
  
  return (
    <nav className="bg-gray-900 shadow-lg border-t border-gray-700 py-2 px-6">
      <div className="flex justify-between items-center">
        <Link href="/dashboard">
          <div className={`flex flex-col items-center ${location === '/dashboard' ? 'text-blue-400' : 'text-gray-400'} cursor-pointer`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </div>
        </Link>
        
        <Link href="/topics">
          <div className={`flex flex-col items-center ${location === '/topics' ? 'text-blue-400' : 'text-gray-400'} cursor-pointer`}>
            <BookOpen className="h-6 w-6" />
            <span className="text-xs mt-1">Topics</span>
          </div>
        </Link>
        
        <Link href="/progress">
          <div className={`flex flex-col items-center ${location === '/progress' ? 'text-blue-400' : 'text-gray-400'} cursor-pointer`}>
            <BarChart2 className="h-6 w-6" />
            <span className="text-xs mt-1">Progress</span>
          </div>
        </Link>
        
        <Link href="/profile">
          <div className={`flex flex-col items-center ${location === '/profile' ? 'text-blue-400' : 'text-gray-400'} cursor-pointer`}>
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
