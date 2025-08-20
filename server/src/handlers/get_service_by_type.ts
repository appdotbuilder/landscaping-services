import { db } from '../db';
import { servicesTable, photosTable } from '../db/schema';
import { type ServiceWithPhotos, type ServiceType } from '../schema';
import { eq, and, asc } from 'drizzle-orm';

export async function getServiceByType(serviceType: ServiceType): Promise<ServiceWithPhotos | null> {
  try {
    // Query service with its photos in a single joined query
    const results = await db.select({
      service: servicesTable,
      photo: photosTable
    })
      .from(servicesTable)
      .leftJoin(photosTable, eq(servicesTable.id, photosTable.service_id))
      .where(and(
        eq(servicesTable.type, serviceType),
        eq(servicesTable.is_active, true)
      ))
      .orderBy(asc(photosTable.display_order))
      .execute();

    if (results.length === 0) {
      return null;
    }

    // Group photos by service (though we only have one service)
    const service = results[0].service;
    const photos = results
      .filter(result => result.photo !== null)
      .map(result => result.photo!);

    return {
      ...service,
      photos: photos
    };
  } catch (error) {
    console.error('Failed to get service by type:', error);
    throw error;
  }
}