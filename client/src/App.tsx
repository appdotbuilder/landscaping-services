import { useState, useEffect, useCallback } from 'react';
import { Separator } from '@/components/ui/separator';
import { ServiceCard } from '@/components/ServiceCard';
import { ContactCard } from '@/components/ContactCard';
import { ServicePreview } from '@/components/ServicePreview';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { trpc } from '@/utils/trpc';
import type { ServiceWithPhotos, CompanyContact, ServiceType } from '../../server/src/schema';

function App() {
  const [services, setServices] = useState<ServiceWithPhotos[]>([]);
  const [companyContact, setCompanyContact] = useState<CompanyContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      // Try to fetch data from backend
      const [servicesData, contactData] = await Promise.all([
        trpc.getServices.query(),
        trpc.getCompanyContact.query()
      ]);
      
      setServices(servicesData);
      setCompanyContact(contactData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setHasError(true);
      
      // Set mock data for demonstration purposes
      // This ensures the app shows the intended landscaping services
      const mockServices: ServiceWithPhotos[] = [
        {
          id: 1,
          type: 'gardening' as ServiceType,
          title: 'Professional Gardening Services',
          description: 'Transform your garden into a beautiful oasis with our expert gardening services. We provide planting, pruning, weeding, and seasonal garden maintenance to keep your outdoor space thriving year-round.',
          is_active: true,
          display_order: 1,
          created_at: new Date(),
          updated_at: new Date(),
          photos: []
        },
        {
          id: 2,
          type: 'lawnmowing' as ServiceType,
          title: 'Lawn Mowing & Maintenance',
          description: 'Keep your lawn looking pristine with our regular mowing and maintenance services. We provide precise cutting, edging, and cleanup to ensure your grass stays healthy and beautiful throughout the growing season.',
          is_active: true,
          display_order: 2,
          created_at: new Date(),
          updated_at: new Date(),
          photos: []
        },
        {
          id: 3,
          type: 'tree_care' as ServiceType,
          title: 'Tree Care & Pruning',
          description: 'Our certified arborists provide comprehensive tree care services including pruning, trimming, disease treatment, and emergency tree removal. We ensure your trees remain healthy, safe, and beautiful.',
          is_active: true,
          display_order: 3,
          created_at: new Date(),
          updated_at: new Date(),
          photos: []
        },
        {
          id: 4,
          type: 'snowblowing' as ServiceType,
          title: 'Snow Removal Services',
          description: 'Stay safe during winter with our reliable snow removal services. We provide prompt snow blowing and clearing for driveways, walkways, and parking areas to keep your property accessible.',
          is_active: true,
          display_order: 4,
          created_at: new Date(),
          updated_at: new Date(),
          photos: []
        },
        {
          id: 5,
          type: 'shoveling' as ServiceType,
          title: 'Hand Shoveling & Detail Work',
          description: 'For precise snow and debris removal in tight spaces, our hand shoveling services provide the attention to detail your property deserves. Perfect for stairs, walkways, and delicate landscaping areas.',
          is_active: true,
          display_order: 5,
          created_at: new Date(),
          updated_at: new Date(),
          photos: []
        }
      ];
      
      setServices(mockServices);
      
      const mockContact: CompanyContact = {
        id: 1,
        company_name: 'GreenScape Landscaping',
        email: 'info@greenscape-landscaping.com',
        phone: '(555) 123-4567',
        address: '123 Garden Lane, Green Valley, GV 12345',
        website: 'https://www.greenscape-landscaping.com',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      setCompanyContact(mockContact);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);



  if (isLoading) {
    return <LoadingSpinner message="Loading landscaping services..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            🌿 GreenScape Landscaping
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional landscaping services to transform your outdoor space into a beautiful oasis
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Services Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer comprehensive landscaping solutions to keep your property looking its best year-round
            </p>
            {hasError && (
              <div className="mt-4 max-w-xl mx-auto">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-blue-400">ℹ️</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Demo Mode:</strong> Backend is currently unavailable. Displaying sample services for demonstration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {services.length === 0 ? (
            <ServicePreview serviceTypes={['gardening', 'shoveling', 'tree_care', 'snowblowing', 'lawnmowing']} />
          ) : (
            <div className="grid gap-8">
              {services
                .sort((a, b) => a.display_order - b.display_order)
                .map((service: ServiceWithPhotos) => (
                  <ServiceCard key={service.id} service={service} />
                ))
              }
            </div>
          )}
        </section>

        <Separator className="my-16" />

        {/* Contact Section */}
        <section className="text-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Get In Touch</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ready to transform your landscape? Contact us today for a free consultation and quote.
            </p>
            {hasError && (
              <div className="mt-4 max-w-xl mx-auto">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-blue-400">ℹ️</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Demo Mode:</strong> Showing sample contact information for demonstration purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <ContactCard contact={companyContact} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-green-100">
            © 2024 GreenScape Landscaping. Transforming landscapes, one project at a time. 🌿
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;