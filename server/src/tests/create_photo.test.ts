import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { photosTable, servicesTable } from '../db/schema';
import { type CreatePhotoInput } from '../schema';
import { createPhoto } from '../handlers/create_photo';
import { eq } from 'drizzle-orm';

describe('createPhoto', () => {
  let testServiceId: number;

  beforeEach(async () => {
    await createDB();
    
    // Create a test service first (required for foreign key)
    const serviceResult = await db.insert(servicesTable)
      .values({
        type: 'gardening',
        title: 'Test Garden Service',
        description: 'A service for testing photo creation',
        is_active: true,
        display_order: 1
      })
      .returning()
      .execute();
    
    testServiceId = serviceResult[0].id;
  });

  afterEach(resetDB);

  it('should create a photo successfully', async () => {
    const testInput: CreatePhotoInput = {
      service_id: testServiceId,
      url: 'https://example.com/photo.jpg',
      alt_text: 'A beautiful garden photo',
      display_order: 1
    };

    const result = await createPhoto(testInput);

    // Basic field validation
    expect(result.service_id).toEqual(testServiceId);
    expect(result.url).toEqual('https://example.com/photo.jpg');
    expect(result.alt_text).toEqual('A beautiful garden photo');
    expect(result.display_order).toEqual(1);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toEqual('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save photo to database', async () => {
    const testInput: CreatePhotoInput = {
      service_id: testServiceId,
      url: 'https://example.com/saved-photo.jpg',
      alt_text: 'Database test photo',
      display_order: 2
    };

    const result = await createPhoto(testInput);

    // Query using proper drizzle syntax
    const photos = await db.select()
      .from(photosTable)
      .where(eq(photosTable.id, result.id))
      .execute();

    expect(photos).toHaveLength(1);
    expect(photos[0].service_id).toEqual(testServiceId);
    expect(photos[0].url).toEqual('https://example.com/saved-photo.jpg');
    expect(photos[0].alt_text).toEqual('Database test photo');
    expect(photos[0].display_order).toEqual(2);
    expect(photos[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent service_id', async () => {
    const testInput: CreatePhotoInput = {
      service_id: 99999, // Non-existent service ID
      url: 'https://example.com/invalid-photo.jpg',
      alt_text: 'Photo with invalid service',
      display_order: 1
    };

    await expect(createPhoto(testInput)).rejects.toThrow(/Service with id 99999 does not exist/i);
  });

  it('should handle multiple photos for same service', async () => {
    const testInput1: CreatePhotoInput = {
      service_id: testServiceId,
      url: 'https://example.com/photo1.jpg',
      alt_text: 'First photo',
      display_order: 1
    };

    const testInput2: CreatePhotoInput = {
      service_id: testServiceId,
      url: 'https://example.com/photo2.jpg',
      alt_text: 'Second photo',
      display_order: 2
    };

    const result1 = await createPhoto(testInput1);
    const result2 = await createPhoto(testInput2);

    // Both photos should be created successfully
    expect(result1.service_id).toEqual(testServiceId);
    expect(result2.service_id).toEqual(testServiceId);
    expect(result1.id).not.toEqual(result2.id);

    // Verify both photos exist in database
    const photos = await db.select()
      .from(photosTable)
      .where(eq(photosTable.service_id, testServiceId))
      .execute();

    expect(photos).toHaveLength(2);
    expect(photos.map(p => p.url)).toContain('https://example.com/photo1.jpg');
    expect(photos.map(p => p.url)).toContain('https://example.com/photo2.jpg');
  });

  it('should handle different display orders correctly', async () => {
    const testInput: CreatePhotoInput = {
      service_id: testServiceId,
      url: 'https://example.com/ordered-photo.jpg',
      alt_text: 'Photo with high display order',
      display_order: 10
    };

    const result = await createPhoto(testInput);

    expect(result.display_order).toEqual(10);

    // Verify in database
    const photo = await db.select()
      .from(photosTable)
      .where(eq(photosTable.id, result.id))
      .execute();

    expect(photo[0].display_order).toEqual(10);
  });
});