import { db } from '../db';
import { servicesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteService(serviceId: number): Promise<boolean> {
  try {
    // Delete service by ID - photos will cascade delete due to foreign key constraint
    const result = await db.delete(servicesTable)
      .where(eq(servicesTable.id, serviceId))
      .execute();

    // Return true if a row was deleted, false if no service found
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Service deletion failed:', error);
    throw error;
  }
}