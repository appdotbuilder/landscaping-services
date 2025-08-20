import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ServicePreviewProps {
  serviceTypes: string[];
}

export function ServicePreview({ serviceTypes }: ServicePreviewProps) {
  const formatServiceType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'gardening':
        return '🌱';
      case 'shoveling':
        return '⛄';
      case 'tree_care':
        return '🌳';
      case 'snowblowing':
        return '❄️';
      case 'lawnmowing':
        return '🌿';
      default:
        return '🏡';
    }
  };

  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🚧</div>
      <h3 className="text-2xl font-semibold text-gray-700 mb-2">Services Coming Soon</h3>
      <p className="text-gray-600 max-w-md mx-auto mb-8">
        We're currently updating our service portfolio. Please check back soon or contact us directly for information about our landscaping services.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {serviceTypes.map((serviceType) => (
          <Card key={serviceType} className="border-dashed border-2 border-gray-300 bg-gray-50">
            <CardHeader className="text-center">
              <div className="text-3xl mb-2">{getServiceIcon(serviceType)}</div>
              <CardTitle className="text-gray-600">{formatServiceType(serviceType)}</CardTitle>
              <CardDescription className="text-gray-500">Coming Soon</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}