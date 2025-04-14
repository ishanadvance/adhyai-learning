import React from 'react';

interface BadgeProps {
  name: string;
  image?: string;
  isLocked?: boolean;
  xpPoints?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Badge({ 
  name, 
  image, 
  isLocked = false, 
  xpPoints,
  className = '', 
  size = 'md',
  onClick
}: BadgeProps) {
  const sizeClasses = {
    sm: { 
      badge: 'w-16 h-16',
      inner: 'w-12 h-12',
      img: 'w-10 h-10', 
      xp: 'w-6 h-6 -top-1 -right-1 text-xs' 
    },
    md: { 
      badge: 'w-24 h-24',
      inner: 'w-20 h-20',
      img: 'w-16 h-16', 
      xp: 'w-8 h-8 -top-2 -right-2 text-sm' 
    },
    lg: { 
      badge: 'w-32 h-32',
      inner: 'w-28 h-28',
      img: 'w-20 h-20', 
      xp: 'w-10 h-10 -top-2 -right-2 text-lg' 
    }
  };
  
  return (
    <div 
      className={`flex flex-col items-center ${className}`}
      onClick={onClick}
    >
      <div className={`relative ${isLocked ? '' : 'badge-animation'}`}>
        <div className={`${isLocked ? 'bg-gray-500' : 'bg-blue-500'} rounded-full flex items-center justify-center ${sizeClasses[size].badge}`}>
          <div className="bg-gray-800 rounded-full flex items-center justify-center ${sizeClasses[size].inner} border border-gray-700">
            {isLocked ? (
              <span className="text-gray-400">?</span>
            ) : (
              image ? (
                <img 
                  src={image} 
                  alt={name} 
                  className={`${sizeClasses[size].img} rounded-full object-cover`} 
                />
              ) : (
                <div className={`${sizeClasses[size].img} rounded-full bg-gray-700 flex items-center justify-center text-blue-400 font-bold`}>
                  {name.charAt(0)}
                </div>
              )
            )}
          </div>
        </div>
        
        {xpPoints && !isLocked && (
          <div className={`absolute ${sizeClasses[size].xp} bg-blue-600 rounded-full flex items-center justify-center text-white font-bold border border-white`}>
            +{xpPoints}
          </div>
        )}
      </div>
      
      <span className={`text-xs text-center mt-2 ${isLocked ? 'text-gray-400' : 'text-white'}`}>
        {isLocked ? 'Locked' : name}
      </span>
    </div>
  );
}
