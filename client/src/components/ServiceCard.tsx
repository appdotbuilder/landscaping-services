import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ServiceWithPhotos } from '../../../server/src/schema';

interface ServiceCardProps {
  service: ServiceWithPhotos;
}

export function ServiceCard({ service }: ServiceCardProps) {
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
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 service-card-hover">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getServiceIcon(service.type)}</span>
          <div>
            <CardTitle className="text-2xl">{service.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {formatServiceType(service.type)}
              </Badge>
              {service.is_active && (
                <Badge variant="secondary" className="bg-green-500 text-white">
                  Available
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <CardDescription className="text-gray-700 text-base leading-relaxed mb-6">
          {service.description}
        </CardDescription>
        
        {service.photos && service.photos.length > 0 ? (
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Gallery</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {service.photos
                .sort((a, b) => a.display_order - b.display_order)
                .map((photo) => (
                  <div key={photo.id} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={photo.url}
                      alt={photo.alt_text}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))
              }
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2">📸</div>
            <p className="text-gray-500">Photos coming soon for this service</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}