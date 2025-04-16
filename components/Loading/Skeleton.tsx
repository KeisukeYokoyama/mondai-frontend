interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200';
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md'
  };

  const styles = {
    width: width,
    height: height
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={styles}
    />
  );
}

interface SkeletonContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function SkeletonContainer({ children, className = '' }: SkeletonContainerProps) {
  return (
    <div className={`w-full animate-pulse ${className}`}>
      {children}
    </div>
  );
} 