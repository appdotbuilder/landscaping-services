import { db } from '../db';
import { photosTable, servicesTable } from '../db/schema';
import { type UpdatePhotoInput, type Photo } from '../schema';
import { eq } from 'drizzle-orm';

export async function updatePhoto(input: UpdatePhotoInput): Promise<Photo | null> {
  try {
    // If service_id is being updated, validate that the service exists
    if (input.service_id !== undefined) {
      const service = await db.select()
        .from(servicesTable)
        .where(eq(servicesTable.id, input.service_id))
        .limit(1)
        .execute();

      if (service.length === 0) {
        throw new Error(`Service with id ${input.service_id} not found`);
      }
    }

    // Extract id and create update data
    const { id, ...updateData } = input;

    // Only include fields that are defined (not undefined)
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(updateData).filter(([, value]) => value !== undefined)
    );

    // If no fields to update, return the existing photo
    if (Object.keys(fieldsToUpdate).length === 0) {
      const existing = await db.select()
        .from(photosTable)
        .where(eq(photosTable.id, id))
        .limit(1)
        .execute();
      
      return existing.length > 0 ? existing[0] : null;
    }

    // Update the photo
    const result = await db.update(photosTable)
      .set(fieldsToUpdate)
      .where(eq(photosTable.id, id))
      .returning()
      .execute();

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Photo update failed:', error);
    throw error;
  }
}