import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { servicesTable, photosTable } from '../db/schema';
import { deletePhoto } from '../handlers/delete_photo';
import { eq } from 'drizzle-orm';

describe('deletePhoto', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing photo and return true', async () => {
    // Create a service first (required for foreign key)
    const serviceResult = await db.insert(servicesTable)
      .values({
        type: 'gardening',
        title: 'Test Service',
        description: 'A service for testing',
        is_active: true,
        display_order: 1
      })
      .returning()
      .execute();

    const serviceId = serviceResult[0].id;

    // Create a photo
    const photoResult = await db.insert(photosTable)
      .values({
        service_id: serviceId,
        url: 'https://example.com/photo.jpg',
        alt_text: 'Test photo',
        display_order: 1
      })
      .returning()
      .execute();

    const photoId = photoResult[0].id;

    // Delete the photo
    const result = await deletePhoto(photoId);

    // Should return true
    expect(result).toBe(true);

    // Verify photo is deleted from database
    const photos = await db.select()
      .from(photosTable)
      .where(eq(photosTable.id, photoId))
      .execute();

    expect(photos).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent photo', async () => {
    // Try to delete a photo that doesn't exist
    const result = await deletePhoto(99999);

    // Should return false
    expect(result).toBe(false);
  });

  it('should handle multiple photos correctly', async () => {
    // Create a service first
    const serviceResult = await db.insert(servicesTable)
      .values({
        type: 'lawnmowing',
        title: 'Test Service',
        description: 'A service for testing',
        is_active: true,
        display_order: 1
      })
      .returning()
      .execute();

    const serviceId = serviceResult[0].id;

    // Create multiple photos
    const photosData = [
      {
        service_id: serviceId,
        url: 'https://example.com/photo1.jpg',
        alt_text: 'Test photo 1',
        display_order: 1
      },
      {
        service_id: serviceId,
        url: 'https://example.com/photo2.jpg',
        alt_text: 'Test photo 2',
        display_order: 2
      },
      {
        service_id: serviceId,
        url: 'https://example.com/photo3.jpg',
        alt_text: 'Test photo 3',
        display_order: 3
      }
    ];

    const photoResults = await db.insert(photosTable)
      .values(photosData)
      .returning()
      .execute();

    const photoIds = photoResults.map(photo => photo.id);

    // Delete the middle photo
    const result = await deletePhoto(photoIds[1]);

    // Should return true
    expect(result).toBe(true);

    // Verify only the middle photo is deleted
    const remainingPhotos = await db.select()
      .from(photosTable)
      .where(eq(photosTable.service_id, serviceId))
      .execute();

    expect(remainingPhotos).toHaveLength(2);
    expect(remainingPhotos.map(p => p.id)).toContain(photoIds[0]);
    expect(remainingPhotos.map(p => p.id)).toContain(photoIds[2]);
    expect(remainingPhotos.map(p => p.id)).not.toContain(photoIds[1]);
  });

  it('should not affect other photos when deleting one', async () => {
    // Create two services
    const service1Result = await db.insert(servicesTable)
      .values({
        type: 'tree_care',
        title: 'Tree Service',
        description: 'Tree care service',
        is_active: true,
        display_order: 1
      })
      .returning()
      .execute();

    const service2Result = await db.insert(servicesTable)
      .values({
        type: 'snowblowing',
        title: 'Snow Service',
        description: 'Snow removal service',
        is_active: true,
        display_order: 2
      })
      .returning()
      .execute();

    // Create photos for both services
    const photo1Result = await db.insert(photosTable)
      .values({
        service_id: service1Result[0].id,
        url: 'https://example.com/tree.jpg',
        alt_text: 'Tree photo',
        display_order: 1
      })
      .returning()
      .execute();

    const photo2Result = await db.insert(photosTable)
      .values({
        service_id: service2Result[0].id,
        url: 'https://example.com/snow.jpg',
        alt_text: 'Snow photo',
        display_order: 1
      })
      .returning()
      .execute();

    // Delete photo from service 1
    const result = await deletePhoto(photo1Result[0].id);

    // Should return true
    expect(result).toBe(true);

    // Verify photo2 still exists
    const remainingPhotos = await db.select()
      .from(photosTable)
      .execute();

    expect(remainingPhotos).toHaveLength(1);
    expect(remainingPhotos[0].id).toBe(photo2Result[0].id);
    expect(remainingPhotos[0].service_id).toBe(service2Result[0].id);
  });
});