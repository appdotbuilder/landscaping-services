interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Loading services..." }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🌱</span>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">{message}</p>
          <p className="mt-2 text-sm text-gray-500">
            Growing something beautiful for you...
          </p>
        </div>
      </div>
    </div>
  );
}