export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
}
