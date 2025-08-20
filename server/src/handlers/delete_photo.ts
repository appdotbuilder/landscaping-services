import { db } from '../db';
import { photosTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deletePhoto = async (photoId: number): Promise<boolean> => {
  try {
    // Delete the photo by ID
    const result = await db.delete(photosTable)
      .where(eq(photosTable.id, photoId))
      .execute();

    // Return true if a photo was deleted, false if no photo was found
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Photo deletion failed:', error);
    throw error;
  }
};