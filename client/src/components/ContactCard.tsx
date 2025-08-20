import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Globe } from 'lucide-react';
import type { CompanyContact } from '../../../server/src/schema';

interface ContactCardProps {
  contact: CompanyContact | null;
}

export function ContactCard({ contact }: ContactCardProps) {
  if (!contact) {
    return (
      <Card className="max-w-2xl mx-auto shadow-lg border-dashed border-2 border-gray-300 bg-gray-50">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">📞</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Contact Information</h3>
          <p className="text-gray-600 mb-4">
            We're currently updating our contact details. Please check back soon!
          </p>
          <p className="text-sm text-gray-500">
            In the meantime, feel free to reach out through our social media channels.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardTitle className="text-2xl">{contact.company_name}</CardTitle>
        {contact.is_active && (
          <Badge className="bg-green-500 text-white w-fit mx-auto">
            Currently Available
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-center gap-3 text-gray-700">
          <Mail className="h-5 w-5 text-blue-600" />
          <a href={`mailto:${contact.email}`} className="hover:text-blue-600 transition-colors">
            {contact.email}
          </a>
        </div>
        
        {contact.phone && (
          <div className="flex items-center justify-center gap-3 text-gray-700">
            <Phone className="h-5 w-5 text-blue-600" />
            <a href={`tel:${contact.phone}`} className="hover:text-blue-600 transition-colors">
              {contact.phone}
            </a>
          </div>
        )}
        
        {contact.address && (
          <div className="flex items-center justify-center gap-3 text-gray-700">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>{contact.address}</span>
          </div>
        )}
        
        {contact.website && (
          <div className="flex items-center justify-center gap-3 text-gray-700">
            <Globe className="h-5 w-5 text-blue-600" />
            <a 
              href={contact.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-blue-600 transition-colors"
            >
              Visit our website
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}