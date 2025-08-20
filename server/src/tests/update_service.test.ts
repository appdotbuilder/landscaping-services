import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { servicesTable } from '../db/schema';
import { type UpdateServiceInput, type CreateServiceInput } from '../schema';
import { updateService } from '../handlers/update_service';
import { eq } from 'drizzle-orm';

// Test data
const initialServiceData: CreateServiceInput = {
  type: 'gardening',
  title: 'Test Garden Service',
  description: 'A service for testing garden updates',
  is_active: true,
  display_order: 1
};

describe('updateService', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a service successfully', async () => {
    // Create initial service
    const [createdService] = await db.insert(servicesTable)
      .values({
        ...initialServiceData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning()
      .execute();

    const updateInput: UpdateServiceInput = {
      id: createdService.id,
      title: 'Updated Garden Service',
      description: 'Updated description for garden service',
      is_active: false
    };

    const result = await updateService(updateInput);

    // Verify update was successful
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdService.id);
    expect(result!.title).toEqual('Updated Garden Service');
    expect(result!.description).toEqual('Updated description for garden service');
    expect(result!.is_active).toEqual(false);
    expect(result!.type).toEqual('gardening'); // Unchanged field
    expect(result!.display_order).toEqual(1); // Unchanged field
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(createdService.updated_at.getTime());
  });

  it('should update only specified fields', async () => {
    // Create initial service
    const [createdService] = await db.insert(servicesTable)
      .values({
        ...initialServiceData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning()
      .execute();

    const updateInput: UpdateServiceInput = {
      id: createdService.id,
      title: 'Partially Updated Service'
    };

    const result = await updateService(updateInput);

    // Verify only title was updated
    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Partially Updated Service');
    expect(result!.description).toEqual(initialServiceData.description); // Unchanged
    expect(result!.is_active).toEqual(initialServiceData.is_active); // Unchanged
    expect(result!.type).toEqual(initialServiceData.type); // Unchanged
    expect(result!.display_order).toEqual(initialServiceData.display_order); // Unchanged
  });

  it('should update service type', async () => {
    // Create initial service
    const [createdService] = await db.insert(servicesTable)
      .values({
        ...initialServiceData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning()
      .execute();

    const updateInput: UpdateServiceInput = {
      id: createdService.id,
      type: 'lawnmowing'
    };

    const result = await updateService(updateInput);

    expect(result).not.toBeNull();
    expect(result!.type).toEqual('lawnmowing');
    expect(result!.title).toEqual(initialServiceData.title); // Unchanged
  });

  it('should update display order', async () => {
    // Create initial service
    const [createdService] = await db.insert(servicesTable)
      .values({
        ...initialServiceData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning()
      .execute();

    const updateInput: UpdateServiceInput = {
      id: createdService.id,
      display_order: 5
    };

    const result = await updateService(updateInput);

    expect(result).not.toBeNull();
    expect(result!.display_order).toEqual(5);
    expect(result!.title).toEqual(initialServiceData.title); // Unchanged
  });

  it('should return null when service does not exist', async () => {
    const updateInput: UpdateServiceInput = {
      id: 99999, // Non-existent ID
      title: 'Updated Service'
    };

    const result = await updateService(updateInput);

    expect(result).toBeNull();
  });

  it('should save updates to database', async () => {
    // Create initial service
    const [createdService] = await db.insert(servicesTable)
      .values({
        ...initialServiceData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning()
      .execute();

    const updateInput: UpdateServiceInput = {
      id: createdService.id,
      title: 'Database Updated Service',
      is_active: false
    };

    await updateService(updateInput);

    // Verify changes were persisted
    const savedServices = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.id, createdService.id))
      .execute();

    expect(savedServices).toHaveLength(1);
    expect(savedServices[0].title).toEqual('Database Updated Service');
    expect(savedServices[0].is_active).toEqual(false);
    expect(savedServices[0].updated_at).toBeInstanceOf(Date);
    expect(savedServices[0].updated_at.getTime()).toBeGreaterThan(createdService.updated_at.getTime());
  });

  it('should handle all valid service types', async () => {
    // Create initial service
    const [createdService] = await db.insert(servicesTable)
      .values({
        ...initialServiceData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning()
      .execute();

    const validTypes = ['gardening', 'shoveling', 'tree_care', 'snowblowing', 'lawnmowing'] as const;

    for (const serviceType of validTypes) {
      const updateInput: UpdateServiceInput = {
        id: createdService.id,
        type: serviceType
      };

      const result = await updateService(updateInput);
      expect(result).not.toBeNull();
      expect(result!.type).toEqual(serviceType);
    }
  });
});