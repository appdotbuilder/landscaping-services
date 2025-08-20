import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { servicesTable, photosTable } from '../db/schema';
import { type ServiceType, type CreateServiceInput, type CreatePhotoInput } from '../schema';
import { getServiceByType } from '../handlers/get_service_by_type';

describe('getServiceByType', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  const createTestService = async (type: ServiceType, isActive: boolean = true) => {
    const serviceInput: CreateServiceInput = {
      type,
      title: `Test ${type} Service`,
      description: `Description for ${type} service`,
      is_active: isActive,
      display_order: 1
    };

    const result = await db.insert(servicesTable)
      .values(serviceInput)
      .returning()
      .execute();

    return result[0];
  };

  const createTestPhoto = async (serviceId: number, displayOrder: number = 1) => {
    const photoInput: CreatePhotoInput = {
      service_id: serviceId,
      url: `https://example.com/photo${displayOrder}.jpg`,
      alt_text: `Test photo ${displayOrder}`,
      display_order: displayOrder
    };

    const result = await db.insert(photosTable)
      .values(photoInput)
      .returning()
      .execute();

    return result[0];
  };

  it('should return service with photos when service exists and is active', async () => {
    // Create test service
    const service = await createTestService('gardening');
    
    // Create test photos
    const photo1 = await createTestPhoto(service.id, 1);
    const photo2 = await createTestPhoto(service.id, 2);

    const result = await getServiceByType('gardening');

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(service.id);
    expect(result!.type).toEqual('gardening');
    expect(result!.title).toEqual('Test gardening Service');
    expect(result!.description).toEqual('Description for gardening service');
    expect(result!.is_active).toBe(true);
    expect(result!.display_order).toEqual(1);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
    
    // Check photos are included and ordered correctly
    expect(result!.photos).toHaveLength(2);
    expect(result!.photos[0].id).toEqual(photo1.id);
    expect(result!.photos[0].url).toEqual('https://example.com/photo1.jpg');
    expect(result!.photos[0].alt_text).toEqual('Test photo 1');
    expect(result!.photos[0].display_order).toEqual(1);
    expect(result!.photos[1].id).toEqual(photo2.id);
    expect(result!.photos[1].display_order).toEqual(2);
  });

  it('should return service with empty photos array when service has no photos', async () => {
    // Create test service without photos
    const service = await createTestService('lawnmowing');

    const result = await getServiceByType('lawnmowing');

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(service.id);
    expect(result!.type).toEqual('lawnmowing');
    expect(result!.photos).toHaveLength(0);
  });

  it('should return null when service does not exist', async () => {
    const result = await getServiceByType('tree_care');

    expect(result).toBeNull();
  });

  it('should return null when service exists but is inactive', async () => {
    // Create inactive service
    await createTestService('shoveling', false);

    const result = await getServiceByType('shoveling');

    expect(result).toBeNull();
  });

  it('should return correct service when multiple services exist', async () => {
    // Create multiple services
    const gardeningService = await createTestService('gardening');
    const snowblowingService = await createTestService('snowblowing');
    
    // Create photos for both services
    await createTestPhoto(gardeningService.id, 1);
    await createTestPhoto(snowblowingService.id, 1);

    const result = await getServiceByType('snowblowing');

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(snowblowingService.id);
    expect(result!.type).toEqual('snowblowing');
    expect(result!.photos).toHaveLength(1);
    expect(result!.photos[0].service_id).toEqual(snowblowingService.id);
  });

  it('should order photos by display_order correctly', async () => {
    // Create test service
    const service = await createTestService('tree_care');
    
    // Create photos in non-sequential order
    const photo3 = await createTestPhoto(service.id, 3);
    const photo1 = await createTestPhoto(service.id, 1);
    const photo2 = await createTestPhoto(service.id, 2);

    const result = await getServiceByType('tree_care');

    expect(result).not.toBeNull();
    expect(result!.photos).toHaveLength(3);
    
    // Photos should be ordered by display_order
    expect(result!.photos[0].id).toEqual(photo1.id);
    expect(result!.photos[0].display_order).toEqual(1);
    expect(result!.photos[1].id).toEqual(photo2.id);
    expect(result!.photos[1].display_order).toEqual(2);
    expect(result!.photos[2].id).toEqual(photo3.id);
    expect(result!.photos[2].display_order).toEqual(3);
  });

  it('should handle all service types correctly', async () => {
    const serviceTypes: ServiceType[] = ['gardening', 'shoveling', 'tree_care', 'snowblowing', 'lawnmowing'];
    
    // Create services for each type
    for (const type of serviceTypes) {
      await createTestService(type);
    }

    // Test each service type can be retrieved
    for (const type of serviceTypes) {
      const result = await getServiceByType(type);
      expect(result).not.toBeNull();
      expect(result!.type).toEqual(type);
      expect(result!.title).toEqual(`Test ${type} Service`);
    }
  });
});