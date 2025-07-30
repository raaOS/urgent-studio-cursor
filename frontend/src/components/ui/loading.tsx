'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'button' | 'image' | 'list';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className, 
  variant = 'card',
  count = 1 
}) => {
  const baseClasses = "animate-pulse bg-muted rounded-md";

  const variants = {
    card: "h-48 w-full",
    text: "h-4 w-3/4",
    button: "h-10 w-24",
    image: "h-32 w-32",
    list: "h-16 w-full"
  };

  const skeletonClass = cn(baseClasses, variants[variant], className);

  if (count === 1) {
    return <div className={skeletonClass} />;
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClass} />
      ))}
    </div>
  );
};

interface ProductCardSkeletonProps {
  count?: number;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="border-2 border-foreground rounded-md p-4 space-y-4">
          <LoadingSkeleton variant="image" className="w-full h-48" />
          <LoadingSkeleton variant="text" className="h-6 w-full" />
          <LoadingSkeleton variant="text" className="h-4 w-2/3" />
          <div className="flex justify-between items-center">
            <LoadingSkeleton variant="text" className="h-6 w-20" />
            <LoadingSkeleton variant="button" />
          </div>
        </div>
      ))}
    </div>
  );
};

interface TestimonialSkeletonProps {
  count?: number;
}

export const TestimonialSkeleton: React.FC<TestimonialSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-4 bg-white rounded-md border-2 border-black space-y-4">
          <LoadingSkeleton variant="text" count={3} />
          <LoadingSkeleton variant="text" className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn("animate-spin rounded-full border-2 border-primary border-t-transparent", sizeClasses[size], className)} />
  );
};

export default LoadingSkeleton;