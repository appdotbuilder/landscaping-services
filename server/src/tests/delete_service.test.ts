import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { servicesTable, photosTable } from '../db/schema';
import { type CreateServiceInput, type CreatePhotoInput } from '../schema';
import { deleteService } from '../handlers/delete_service';
import { eq } from 'drizzle-orm';

// Test service input
const testServiceInput: CreateServiceInput = {
  type: 'gardening',
  title: 'Test Gardening Service',
  description: 'A test gardening service for deletion testing',
  is_active: true,
  display_order: 1
};

// Test photo input (without service_id, will be set in tests)
const testPhotoInput: Omit<CreatePhotoInput, 'service_id'> = {
  url: 'https://example.com/photo.jpg',
  alt_text: 'Test photo',
  display_order: 1
};

describe('deleteService', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a service successfully', async () => {
    // Create a test service
    const serviceResult = await db.insert(servicesTable)
      .values(testServiceInput)
      .returning()
      .execute();
    
    const serviceId = serviceResult[0].id;

    // Delete the service
    const result = await deleteService(serviceId);

    // Verify deletion was successful
    expect(result).toBe(true);

    // Verify service no longer exists in database
    const services = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.id, serviceId))
      .execute();

    expect(services).toHaveLength(0);
  });

  it('should return false when service does not exist', async () => {
    // Try to delete a non-existent service
    const result = await deleteService(99999);

    // Should return false for non-existent service
    expect(result).toBe(false);
  });

  it('should cascade delete associated photos', async () => {
    // Create a test service
    const serviceResult = await db.insert(servicesTable)
      .values(testServiceInput)
      .returning()
      .execute();
    
    const serviceId = serviceResult[0].id;

    // Create test photos for the service
    await db.insert(photosTable)
      .values([
        {
          service_id: serviceId,
          url: testPhotoInput.url,
          alt_text: testPhotoInput.alt_text,
          display_order: 1
        },
        {
          service_id: serviceId,
          url: 'https://example.com/photo2.jpg',
          alt_text: 'Test photo 2',
          display_order: 2
        }
      ])
      .execute();

    // Verify photos exist before deletion
    const photosBeforeDeletion = await db.select()
      .from(photosTable)
      .where(eq(photosTable.service_id, serviceId))
      .execute();

    expect(photosBeforeDeletion).toHaveLength(2);

    // Delete the service
    const result = await deleteService(serviceId);

    // Verify deletion was successful
    expect(result).toBe(true);

    // Verify service no longer exists
    const services = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.id, serviceId))
      .execute();

    expect(services).toHaveLength(0);

    // Verify photos were cascade deleted
    const photosAfterDeletion = await db.select()
      .from(photosTable)
      .where(eq(photosTable.service_id, serviceId))
      .execute();

    expect(photosAfterDeletion).toHaveLength(0);
  });

  it('should handle deletion of service with no photos', async () => {
    // Create a test service without photos
    const serviceResult = await db.insert(servicesTable)
      .values(testServiceInput)
      .returning()
      .execute();
    
    const serviceId = serviceResult[0].id;

    // Verify no photos exist for this service
    const photosBeforeDeletion = await db.select()
      .from(photosTable)
      .where(eq(photosTable.service_id, serviceId))
      .execute();

    expect(photosBeforeDeletion).toHaveLength(0);

    // Delete the service
    const result = await deleteService(serviceId);

    // Verify deletion was successful
    expect(result).toBe(true);

    // Verify service no longer exists
    const services = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.id, serviceId))
      .execute();

    expect(services).toHaveLength(0);
  });

  it('should only delete the specified service', async () => {
    // Create multiple test services
    const service1Result = await db.insert(servicesTable)
      .values(testServiceInput)
      .returning()
      .execute();
    
    const service2Result = await db.insert(servicesTable)
      .values({
        ...testServiceInput,
        title: 'Second Test Service',
        display_order: 2
      })
      .returning()
      .execute();

    const service1Id = service1Result[0].id;
    const service2Id = service2Result[0].id;

    // Delete only the first service
    const result = await deleteService(service1Id);

    // Verify deletion was successful
    expect(result).toBe(true);

    // Verify first service was deleted
    const service1Check = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.id, service1Id))
      .execute();

    expect(service1Check).toHaveLength(0);

    // Verify second service still exists
    const service2Check = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.id, service2Id))
      .execute();

    expect(service2Check).toHaveLength(1);
    expect(service2Check[0].title).toEqual('Second Test Service');
  });
});