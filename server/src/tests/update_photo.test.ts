import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { photosTable, servicesTable } from '../db/schema';
import { type UpdatePhotoInput, type CreateServiceInput } from '../schema';
import { updatePhoto } from '../handlers/update_photo';
import { eq } from 'drizzle-orm';

// Test service data
const testService: CreateServiceInput = {
  type: 'gardening',
  title: 'Garden Maintenance',
  description: 'Professional garden care',
  is_active: true,
  display_order: 1
};

const secondService: CreateServiceInput = {
  type: 'lawnmowing',
  title: 'Lawn Mowing',
  description: 'Professional lawn care',
  is_active: true,
  display_order: 2
};

describe('updatePhoto', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update photo fields', async () => {
    // Create a service first
    const serviceResult = await db.insert(servicesTable)
      .values(testService)
      .returning()
      .execute();
    const serviceId = serviceResult[0].id;

    // Create a photo
    const photoResult = await db.insert(photosTable)
      .values({
        service_id: serviceId,
        url: 'https://example.com/old-photo.jpg',
        alt_text: 'Old description',
        display_order: 1
      })
      .returning()
      .execute();
    const photoId = photoResult[0].id;

    // Update the photo
    const updateInput: UpdatePhotoInput = {
      id: photoId,
      url: 'https://example.com/new-photo.jpg',
      alt_text: 'New description',
      display_order: 2
    };

    const result = await updatePhoto(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(photoId);
    expect(result!.url).toEqual('https://example.com/new-photo.jpg');
    expect(result!.alt_text).toEqual('New description');
    expect(result!.display_order).toEqual(2);
    expect(result!.service_id).toEqual(serviceId);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should update photo service_id when valid service exists', async () => {
    // Create two services
    const service1Result = await db.insert(servicesTable)
      .values(testService)
      .returning()
      .execute();
    const service1Id = service1Result[0].id;

    const service2Result = await db.insert(servicesTable)
      .values(secondService)
      .returning()
      .execute();
    const service2Id = service2Result[0].id;

    // Create a photo for first service
    const photoResult = await db.insert(photosTable)
      .values({
        service_id: service1Id,
        url: 'https://example.com/photo.jpg',
        alt_text: 'Test photo',
        display_order: 1
      })
      .returning()
      .execute();
    const photoId = photoResult[0].id;

    // Update photo to belong to second service
    const updateInput: UpdatePhotoInput = {
      id: photoId,
      service_id: service2Id
    };

    const result = await updatePhoto(updateInput);

    expect(result).toBeDefined();
    expect(result!.service_id).toEqual(service2Id);
    expect(result!.url).toEqual('https://example.com/photo.jpg'); // Other fields unchanged
  });

  it('should update only specified fields', async () => {
    // Create a service
    const serviceResult = await db.insert(servicesTable)
      .values(testService)
      .returning()
      .execute();
    const serviceId = serviceResult[0].id;

    // Create a photo
    const photoResult = await db.insert(photosTable)
      .values({
        service_id: serviceId,
        url: 'https://example.com/original.jpg',
        alt_text: 'Original description',
        display_order: 1
      })
      .returning()
      .execute();
    const photoId = photoResult[0].id;

    // Update only the alt_text
    const updateInput: UpdatePhotoInput = {
      id: photoId,
      alt_text: 'Updated description'
    };

    const result = await updatePhoto(updateInput);

    expect(result).toBeDefined();
    expect(result!.alt_text).toEqual('Updated description');
    expect(result!.url).toEqual('https://example.com/original.jpg'); // Unchanged
    expect(result!.display_order).toEqual(1); // Unchanged
    expect(result!.service_id).toEqual(serviceId); // Unchanged
  });

  it('should return existing photo when no fields to update', async () => {
    // Create a service
    const serviceResult = await db.insert(servicesTable)
      .values(testService)
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

    // Call update with only id (no fields to update)
    const updateInput: UpdatePhotoInput = {
      id: photoId
    };

    const result = await updatePhoto(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(photoId);
    expect(result!.url).toEqual('https://example.com/photo.jpg');
    expect(result!.alt_text).toEqual('Test photo');
  });

  it('should return null when photo does not exist', async () => {
    const updateInput: UpdatePhotoInput = {
      id: 999,
      alt_text: 'New description'
    };

    const result = await updatePhoto(updateInput);

    expect(result).toBeNull();
  });

  it('should throw error when service_id does not exist', async () => {
    // Create a service
    const serviceResult = await db.insert(servicesTable)
      .values(testService)
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

    // Try to update with non-existent service_id
    const updateInput: UpdatePhotoInput = {
      id: photoId,
      service_id: 999
    };

    await expect(updatePhoto(updateInput)).rejects.toThrow(/Service with id 999 not found/i);
  });

  it('should save updates to database', async () => {
    // Create a service
    const serviceResult = await db.insert(servicesTable)
      .values(testService)
      .returning()
      .execute();
    const serviceId = serviceResult[0].id;

    // Create a photo
    const photoResult = await db.insert(photosTable)
      .values({
        service_id: serviceId,
        url: 'https://example.com/old.jpg',
        alt_text: 'Old description',
        display_order: 1
      })
      .returning()
      .execute();
    const photoId = photoResult[0].id;

    // Update the photo
    const updateInput: UpdatePhotoInput = {
      id: photoId,
      url: 'https://example.com/new.jpg',
      display_order: 5
    };

    await updatePhoto(updateInput);

    // Verify changes were saved to database
    const photos = await db.select()
      .from(photosTable)
      .where(eq(photosTable.id, photoId))
      .execute();

    expect(photos).toHaveLength(1);
    expect(photos[0].url).toEqual('https://example.com/new.jpg');
    expect(photos[0].display_order).toEqual(5);
    expect(photos[0].alt_text).toEqual('Old description'); // Unchanged
  });
});