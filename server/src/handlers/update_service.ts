import { db } from '../db';
import { servicesTable } from '../db/schema';
import { type UpdateServiceInput, type Service } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateService(input: UpdateServiceInput): Promise<Service | null> {
  try {
    // Destructure the input to separate id from update fields
    const { id, ...updateFields } = input;

    // Add updated_at timestamp to the update fields
    const fieldsToUpdate = {
      ...updateFields,
      updated_at: new Date()
    };

    // Update the service record
    const result = await db.update(servicesTable)
      .set(fieldsToUpdate)
      .where(eq(servicesTable.id, id))
      .returning()
      .execute();

    // Return null if no service was found/updated
    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Service update failed:', error);
    throw error;
  }
}