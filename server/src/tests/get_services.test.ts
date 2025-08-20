import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { servicesTable, photosTable } from '../db/schema';
import { getServices } from '../handlers/get_services';
import type { ServiceType } from '../schema';

describe('getServices', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no services exist', async () => {
    const result = await getServices();
    expect(result).toEqual([]);
  });

  it('should return only active services', async () => {
    // Create active service
    await db.insert(servicesTable).values({
      type: 'gardening' as ServiceType,
      title: 'Active Garden Service',
      description: 'Active garden maintenance',
      is_active: true,
      display_order: 1
    }).execute();

    // Create inactive service
    await db.insert(servicesTable).values({
      type: 'lawnmowing' as ServiceType,
      title: 'Inactive Lawn Service',
      description: 'Inactive lawn maintenance',
      is_active: false,
      display_order: 2
    }).execute();

    const result = await getServices();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Active Garden Service');
    expect(result[0].is_active).toBe(true);
    expect(result[0].photos).toEqual([]);
  });

  it('should return services ordered by display_order', async () => {
    // Create services in reverse order
    await db.insert(servicesTable).values({
      type: 'snowblowing' as ServiceType,
      title: 'Snow Service',
      description: 'Snow removal',
      is_active: true,
      display_order: 3
    }).execute();

    await db.insert(servicesTable).values({
      type: 'gardening' as ServiceType,
      title: 'Garden Service',
      description: 'Garden maintenance',
      is_active: true,
      display_order: 1
    }).execute();

    await db.insert(servicesTable).values({
      type: 'lawnmowing' as ServiceType,
      title: 'Lawn Service',
      description: 'Lawn maintenance',
      is_active: true,
      display_order: 2
    }).execute();

    const result = await getServices();

    expect(result).toHaveLength(3);
    expect(result[0].display_order).toBe(1);
    expect(result[0].title).toBe('Garden Service');
    expect(result[1].display_order).toBe(2);
    expect(result[1].title).toBe('Lawn Service');
    expect(result[2].display_order).toBe(3);
    expect(result[2].title).toBe('Snow Service');
  });

  it('should return services with their photos', async () => {
    // Create service
    const serviceResult = await db.insert(servicesTable).values({
      type: 'tree_care' as ServiceType,
      title: 'Tree Care Service',
      description: 'Professional tree care',
      is_active: true,
      display_order: 1
    }).returning().execute();

    const serviceId = serviceResult[0].id;

    // Create photos for the service
    await db.insert(photosTable).values([
      {
        service_id: serviceId,
        url: 'https://example.com/photo2.jpg',
        alt_text: 'Second tree photo',
        display_order: 2
      },
      {
        service_id: serviceId,
        url: 'https://example.com/photo1.jpg',
        alt_text: 'First tree photo',
        display_order: 1
      },
      {
        service_id: serviceId,
        url: 'https://example.com/photo3.jpg',
        alt_text: 'Third tree photo',
        display_order: 3
      }
    ]).execute();

    const result = await getServices();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Tree Care Service');
    expect(result[0].photos).toHaveLength(3);

    // Verify photos are ordered by display_order
    expect(result[0].photos[0].display_order).toBe(1);
    expect(result[0].photos[0].alt_text).toBe('First tree photo');
    expect(result[0].photos[1].display_order).toBe(2);
    expect(result[0].photos[1].alt_text).toBe('Second tree photo');
    expect(result[0].photos[2].display_order).toBe(3);
    expect(result[0].photos[2].alt_text).toBe('Third tree photo');
  });

  it('should return multiple services with their respective photos', async () => {
    // Create first service
    const service1Result = await db.insert(servicesTable).values({
      type: 'gardening' as ServiceType,
      title: 'Garden Service',
      description: 'Garden maintenance',
      is_active: true,
      display_order: 1
    }).returning().execute();

    // Create second service
    const service2Result = await db.insert(servicesTable).values({
      type: 'shoveling' as ServiceType,
      title: 'Shoveling Service',
      description: 'Snow shoveling',
      is_active: true,
      display_order: 2
    }).returning().execute();

    const service1Id = service1Result[0].id;
    const service2Id = service2Result[0].id;

    // Create photos for first service
    await db.insert(photosTable).values([
      {
        service_id: service1Id,
        url: 'https://example.com/garden1.jpg',
        alt_text: 'Garden photo 1',
        display_order: 1
      },
      {
        service_id: service1Id,
        url: 'https://example.com/garden2.jpg',
        alt_text: 'Garden photo 2',
        display_order: 2
      }
    ]).execute();

    // Create photos for second service
    await db.insert(photosTable).values([
      {
        service_id: service2Id,
        url: 'https://example.com/shovel1.jpg',
        alt_text: 'Shoveling photo 1',
        display_order: 1
      }
    ]).execute();

    const result = await getServices();

    expect(result).toHaveLength(2);

    // First service
    expect(result[0].title).toBe('Garden Service');
    expect(result[0].photos).toHaveLength(2);
    expect(result[0].photos[0].alt_text).toBe('Garden photo 1');
    expect(result[0].photos[1].alt_text).toBe('Garden photo 2');

    // Second service
    expect(result[1].title).toBe('Shoveling Service');
    expect(result[1].photos).toHaveLength(1);
    expect(result[1].photos[0].alt_text).toBe('Shoveling photo 1');
  });

  it('should return services with empty photos array when no photos exist', async () => {
    await db.insert(servicesTable).values({
      type: 'lawnmowing' as ServiceType,
      title: 'Lawn Service',
      description: 'Professional lawn care',
      is_active: true,
      display_order: 1
    }).execute();

    const result = await getServices();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Lawn Service');
    expect(result[0].photos).toEqual([]);
  });

  it('should handle all service types correctly', async () => {
    const serviceTypes: ServiceType[] = ['gardening', 'shoveling', 'tree_care', 'snowblowing', 'lawnmowing'];
    
    // Create services for each type
    for (let i = 0; i < serviceTypes.length; i++) {
      await db.insert(servicesTable).values({
        type: serviceTypes[i],
        title: `${serviceTypes[i]} Service`,
        description: `Professional ${serviceTypes[i]}`,
        is_active: true,
        display_order: i + 1
      }).execute();
    }

    const result = await getServices();

    expect(result).toHaveLength(5);
    for (let i = 0; i < serviceTypes.length; i++) {
      expect(result[i].type).toBe(serviceTypes[i]);
      expect(result[i].title).toBe(`${serviceTypes[i]} Service`);
    }
  });

  it('should validate service fields are properly typed', async () => {
    await db.insert(servicesTable).values({
      type: 'gardening' as ServiceType,
      title: 'Test Service',
      description: 'Test description',
      is_active: true,
      display_order: 1
    }).execute();

    const result = await getServices();

    expect(result).toHaveLength(1);
    const service = result[0];

    // Validate all required fields exist and have correct types
    expect(typeof service.id).toBe('number');
    expect(typeof service.type).toBe('string');
    expect(typeof service.title).toBe('string');
    expect(typeof service.description).toBe('string');
    expect(typeof service.is_active).toBe('boolean');
    expect(typeof service.display_order).toBe('number');
    expect(service.created_at).toBeInstanceOf(Date);
    expect(service.updated_at).toBeInstanceOf(Date);
    expect(Array.isArray(service.photos)).toBe(true);
  });
});