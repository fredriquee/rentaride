// Generic skeleton line component
export const SkeletonLine = ({ width = "w-full", height = "h-4", className = "" }) => (
  <div
    className={`bg-gray-300 dark:bg-gray-700 rounded animate-pulse ${width} ${height} ${className}`}
  />
);

// Vehicle card skeleton
export const VehicleCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 border-gray-200 overflow-hidden shadow-sm">
    {/* Image placeholder */}
    <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 animate-pulse" />
    
    <div className="p-4 space-y-3">
      {/* Title */}
      <SkeletonLine width="w-2/3" height="h-5" />
      
      {/* Type and location */}
      <div className="space-y-2">
        <SkeletonLine width="w-1/3" height="h-3" />
        <SkeletonLine width="w-1/2" height="h-3" />
      </div>
      
      {/* Details */}
      <div className="pt-2 space-y-2">
        <SkeletonLine width="w-2/5" height="h-3" />
        <SkeletonLine width="w-1/3" height="h-3" />
      </div>
      
      {/* Button */}
      <div className="pt-4">
        <SkeletonLine width="w-full" height="h-9" className="rounded-md" />
      </div>
    </div>
  </div>
);

// Dashboard stats card skeleton
export const StatCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-6 border dark:border-gray-700 border-gray-200">
    <div className="space-y-3">
      <SkeletonLine width="w-2/3" height="h-3" />
      <SkeletonLine width="w-1/2" height="h-8" />
    </div>
  </div>
);

// Booking card skeleton
export const BookingCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3 border dark:border-gray-700 border-gray-200">
    {/* Title and status */}
    <div className="flex justify-between items-start gap-2">
      <SkeletonLine width="w-1/2" height="h-5" />
      <SkeletonLine width="w-20" height="h-6" className="rounded-full" />
    </div>
    
    {/* Details */}
    <div className="space-y-2">
      <SkeletonLine width="w-2/3" height="h-3" />
      <SkeletonLine width="w-1/2" height="h-3" />
      <SkeletonLine width="w-3/5" height="h-3" />
    </div>
    
    {/* Button */}
    <div className="pt-2">
      <SkeletonLine width="w-1/3" height="h-8" className="rounded-md" />
    </div>
  </div>
);

// Chart skeleton (for dashboard charts)
export const ChartSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4 border dark:border-gray-700 border-gray-200">
    <SkeletonLine width="w-1/3" height="h-5" />
    <div className="h-64 space-y-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex gap-2 items-end h-6">
          <SkeletonLine width={`w-${(i % 5) + 1}/12`} height="h-full" />
        </div>
      ))}
    </div>
  </div>
);

// Vehicle list with pagination skeleton
export const VehicleListSkeleton = ({ count = 6 }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <VehicleCardSkeleton key={i} />
      ))}
    </div>
    
    {/* Pagination skeleton */}
    <div className="flex justify-center gap-2 pt-4">
      <SkeletonLine width="w-10" height="h-10" className="rounded-md" />
      {[...Array(3)].map((_, i) => (
        <SkeletonLine key={i} width="w-10" height="h-10" className="rounded-md" />
      ))}
      <SkeletonLine width="w-10" height="h-10" className="rounded-md" />
    </div>
  </div>
);

// Booking page vehicle detail skeleton
export const BookingPageSkeleton = () => (
  <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-3xl shadow-lg border dark:border-gray-700 border-gray-100 overflow-hidden flex flex-col md:flex-row">
      {/* Left Side */}
      <div className="md:w-1/2 bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 space-y-4">
        {/* Image */}
        <div className="relative rounded-lg sm:rounded-2xl overflow-hidden aspect-video bg-gray-300 dark:bg-gray-700 animate-pulse" />
        
        {/* Title */}
        <SkeletonLine width="w-2/3" height="h-7" />
        
        {/* Type and location */}
        <div className="space-y-2">
          <SkeletonLine width="w-1/3" height="h-3" />
          <SkeletonLine width="w-1/2" height="h-3" />
        </div>
        
        {/* Info box and details */}
        <div className="space-y-3 pt-4">
          <SkeletonLine width="w-full" height="h-24" className="rounded-lg" />
          <SkeletonLine width="w-full" height="h-16" className="rounded-lg" />
        </div>
      </div>
      
      {/* Right Side */}
      <div className="md:w-1/2 p-4 sm:p-6 md:p-8 space-y-4">
        {/* Form fields */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1">
            <SkeletonLine width="w-1/4" height="h-3" />
            <SkeletonLine width="w-full" height="h-10" className="rounded-md" />
          </div>
        ))}
        
        {/* Price box */}
        <SkeletonLine width="w-full" height="h-16" className="rounded-lg mt-4" />
        
        {/* Button */}
        <SkeletonLine width="w-full" height="h-11" className="rounded-md mt-4" />
      </div>
    </div>
  </div>
);

// Dashboard grid skeleton
export const DashboardSkeleton = () => (
  <div className="space-y-8">
    {/* Header */}
    <div>
      <SkeletonLine width="w-1/3" height="h-8" />
      <SkeletonLine width="w-1/2" height="h-4" className="mt-2" />
    </div>
    
    {/* Stats Grid */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {[...Array(5)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
    
    {/* Tabs */}
    <div className="flex gap-2 border-b dark:border-gray-700 border-gray-200">
      {[...Array(3)].map((_, i) => (
        <SkeletonLine key={i} width="w-20" height="h-4" />
      ))}
    </div>
    
    {/* Content */}
    <ChartSkeleton />
  </div>
);

// Manage vehicles skeleton
export const ManageVehiclesSkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 border-gray-200 p-4 space-y-3">
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine width="w-1/2" height="h-5" />
            <SkeletonLine width="w-2/3" height="h-3" />
            <SkeletonLine width="w-1/3" height="h-3" />
          </div>
          <div className="flex gap-2">
            <SkeletonLine width="w-10" height="h-10" className="rounded-md" />
            <SkeletonLine width="w-10" height="h-10" className="rounded-md" />
          </div>
        </div>
      </div>
    ))}
  </div>
);
