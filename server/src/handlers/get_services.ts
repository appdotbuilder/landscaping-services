import { db } from '../db';
import { servicesTable, photosTable } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { type ServiceWithPhotos } from '../schema';

export async function getServices(): Promise<ServiceWithPhotos[]> {
  try {
    // Get all active services ordered by display_order
    const services = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.is_active, true))
      .orderBy(asc(servicesTable.display_order))
      .execute();

    // For each service, fetch its photos ordered by display_order
    const servicesWithPhotos: ServiceWithPhotos[] = [];
    
    for (const service of services) {
      const photos = await db.select()
        .from(photosTable)
        .where(eq(photosTable.service_id, service.id))
        .orderBy(asc(photosTable.display_order))
        .execute();

      servicesWithPhotos.push({
        ...service,
        photos
      });
    }

    return servicesWithPhotos;
  } catch (error) {
    console.error('Failed to fetch services:', error);
    throw error;
  }
}