import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { servicesTable } from '../db/schema';
import { type CreateServiceInput } from '../schema';
import { createService } from '../handlers/create_service';
import { eq } from 'drizzle-orm';

// Complete test input with all required fields
const testInput: CreateServiceInput = {
  type: 'gardening',
  title: 'Premium Garden Care',
  description: 'Complete garden maintenance including planting, weeding, and fertilization',
  is_active: true,
  display_order: 1
};

describe('createService', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a service with all fields', async () => {
    const result = await createService(testInput);

    // Validate all fields are correctly set
    expect(result.type).toEqual('gardening');
    expect(result.title).toEqual('Premium Garden Care');
    expect(result.description).toEqual('Complete garden maintenance including planting, weeding, and fertilization');
    expect(result.is_active).toEqual(true);
    expect(result.display_order).toEqual(1);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save service to database', async () => {
    const result = await createService(testInput);

    // Query database to verify service was saved
    const services = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.id, result.id))
      .execute();

    expect(services).toHaveLength(1);
    const savedService = services[0];
    expect(savedService.type).toEqual('gardening');
    expect(savedService.title).toEqual('Premium Garden Care');
    expect(savedService.description).toEqual(testInput.description);
    expect(savedService.is_active).toEqual(true);
    expect(savedService.display_order).toEqual(1);
    expect(savedService.created_at).toBeInstanceOf(Date);
    expect(savedService.updated_at).toBeInstanceOf(Date);
  });

  it('should apply default is_active value when explicitly set to true', async () => {
    const inputWithDefaults: CreateServiceInput = {
      type: 'lawnmowing',
      title: 'Basic Lawn Service',
      description: 'Weekly lawn mowing service',
      is_active: true, // Explicitly set to test the default behavior
      display_order: 2
    };

    const result = await createService(inputWithDefaults);

    expect(result.is_active).toEqual(true);
    expect(result.type).toEqual('lawnmowing');
    expect(result.title).toEqual('Basic Lawn Service');
    expect(result.display_order).toEqual(2);
  });

  it('should handle different service types', async () => {
    const serviceTypes: Array<{ type: 'shoveling' | 'tree_care' | 'snowblowing', title: string }> = [
      { type: 'shoveling', title: 'Snow Shoveling Service' },
      { type: 'tree_care', title: 'Tree Pruning & Care' },
      { type: 'snowblowing', title: 'Snow Blowing Service' }
    ];

    for (const serviceType of serviceTypes) {
      const input: CreateServiceInput = {
        type: serviceType.type,
        title: serviceType.title,
        description: `Professional ${serviceType.type} service`,
        is_active: true,
        display_order: 1
      };

      const result = await createService(input);
      
      expect(result.type).toEqual(serviceType.type);
      expect(result.title).toEqual(serviceType.title);
      expect(result.is_active).toEqual(true);
    }
  });

  it('should set updated_at to current timestamp', async () => {
    const beforeCreation = new Date();
    const result = await createService(testInput);
    const afterCreation = new Date();

    // Verify updated_at is set to a current timestamp
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at >= beforeCreation).toBe(true);
    expect(result.updated_at <= afterCreation).toBe(true);
    
    // Verify created_at and updated_at are close in time (within 1 second)
    const timeDiff = Math.abs(result.updated_at.getTime() - result.created_at.getTime());
    expect(timeDiff).toBeLessThan(1000);
  });

  it('should handle inactive services', async () => {
    const inactiveInput: CreateServiceInput = {
      type: 'gardening',
      title: 'Seasonal Garden Setup',
      description: 'Spring garden preparation service',
      is_active: false,
      display_order: 5
    };

    const result = await createService(inactiveInput);

    expect(result.is_active).toEqual(false);
    expect(result.title).toEqual('Seasonal Garden Setup');
    expect(result.display_order).toEqual(5);
  });

  it('should handle zero display order', async () => {
    const zeroOrderInput: CreateServiceInput = {
      type: 'tree_care',
      title: 'Emergency Tree Removal',
      description: 'Emergency tree removal service',
      is_active: true,
      display_order: 0
    };

    const result = await createService(zeroOrderInput);

    expect(result.display_order).toEqual(0);
    expect(result.title).toEqual('Emergency Tree Removal');
  });
});