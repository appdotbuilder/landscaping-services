import { db } from '../db';
import { servicesTable } from '../db/schema';
import { type CreateServiceInput, type Service } from '../schema';

export const createService = async (input: CreateServiceInput): Promise<Service> => {
  try {
    // Insert service record with updated_at set to current timestamp
    const result = await db.insert(servicesTable)
      .values({
        type: input.type,
        title: input.title,
        description: input.description,
        is_active: input.is_active,
        display_order: input.display_order,
        updated_at: new Date() // Explicitly set updated_at to current timestamp
      })
      .returning()
      .execute();

    const service = result[0];
    return service;
  } catch (error) {
    console.error('Service creation failed:', error);
    throw error;
  }
};