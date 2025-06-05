export function CartNavSkeleton() {
  return (
    <div className="fixed bottom-2 right-2 z-50">
      <div className="relative flex items-center justify-center w-[2.6rem] h-[2.6rem] md:w-[3.2rem] md:h-[3.2rem] rounded-full border border-muted bg-muted/20 animate-pulse">
        {/* Cart SVG Icon skeleton - matches exact cart icon */}
        <div className="w-5 h-5 md:w-6 md:h-6 bg-muted/40 rounded animate-pulse" />
        
        {/* Cart Counter Badge skeleton - matches positioning */}
        <div className="absolute -top-1 -right-1 bg-muted/40 text-sm w-3.5 h-3.5 md:w-5 md:h-5 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
