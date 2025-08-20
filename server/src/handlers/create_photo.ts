import { db } from '../db';
import { photosTable, servicesTable } from '../db/schema';
import { type CreatePhotoInput, type Photo } from '../schema';
import { eq } from 'drizzle-orm';

export async function createPhoto(input: CreatePhotoInput): Promise<Photo> {
  try {
    // First, validate that the service exists
    const existingService = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.id, input.service_id))
      .limit(1)
      .execute();

    if (existingService.length === 0) {
      throw new Error(`Service with id ${input.service_id} does not exist`);
    }

    // Insert photo record
    const result = await db.insert(photosTable)
      .values({
        service_id: input.service_id,
        url: input.url,
        alt_text: input.alt_text,
        display_order: input.display_order
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Photo creation failed:', error);
    throw error;
  }
}