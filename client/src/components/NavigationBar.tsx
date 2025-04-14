import React from 'react';
import { useLocation, Link } from 'wouter';
import { Home, BookOpen, BarChart2, User } from 'lucide-react';

export function NavigationBar() {
  const [location] = useLocation();
  
  return (
    <nav className="bg-white shadow-md border-t border-neutral-200 py-2 px-6">
      <div className="flex justify-between items-center">
        <Link href="/dashboard">
          <a className={`flex flex-col items-center ${location === '/dashboard' ? 'text-primary' : 'text-neutral-500'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        
        <Link href="/topics">
          <a className={`flex flex-col items-center ${location === '/topics' ? 'text-primary' : 'text-neutral-500'}`}>
            <BookOpen className="h-6 w-6" />
            <span className="text-xs mt-1">Topics</span>
          </a>
        </Link>
        
        <Link href="/progress">
          <a className={`flex flex-col items-center ${location === '/progress' ? 'text-primary' : 'text-neutral-500'}`}>
            <BarChart2 className="h-6 w-6" />
            <span className="text-xs mt-1">Progress</span>
          </a>
        </Link>
        
        <Link href="/profile">
          <a className={`flex flex-col items-center ${location === '/profile' ? 'text-primary' : 'text-neutral-500'}`}>
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
