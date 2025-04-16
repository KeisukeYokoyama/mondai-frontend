import { Skeleton } from './Skeleton';

export default function CommentatorSkeleton() {
  return (
    <div className="w-full max-w-screen-md mx-auto p-4">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <Skeleton 
          variant="circular"
          width={128}
          height={128}
          className="flex-shrink-0"
        />
        <div className="flex flex-col items-center md:items-start gap-3 w-full">
          <Skeleton variant="text" className="h-8 w-48" />
          <Skeleton variant="text" className="h-4 w-32" />
          <Skeleton variant="text" className="h-4 w-24" />
          <div className="flex gap-3 mt-2">
            <Skeleton variant="rectangular" className="h-6 w-6" />
            <Skeleton variant="rectangular" className="h-6 w-6" />
            <Skeleton variant="rectangular" className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
} 