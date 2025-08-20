import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { companyContactTable } from '../db/schema';
import { getCompanyContact } from '../handlers/get_company_contact';
import { eq } from 'drizzle-orm';

describe('getCompanyContact', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when no company contact exists', async () => {
    const result = await getCompanyContact();
    expect(result).toBeNull();
  });

  it('should return null when only inactive company contacts exist', async () => {
    // Create an inactive company contact
    await db.insert(companyContactTable)
      .values({
        company_name: 'Inactive Company',
        email: 'inactive@example.com',
        phone: '555-0001',
        address: '123 Inactive St',
        website: 'https://inactive.com',
        is_active: false
      })
      .execute();

    const result = await getCompanyContact();
    expect(result).toBeNull();
  });

  it('should return active company contact', async () => {
    // Create an active company contact
    const insertResult = await db.insert(companyContactTable)
      .values({
        company_name: 'Green Thumb Services',
        email: 'contact@greenthumb.com',
        phone: '555-0123',
        address: '456 Garden Ave',
        website: 'https://greenthumb.com',
        is_active: true
      })
      .returning()
      .execute();

    const result = await getCompanyContact();

    expect(result).not.toBeNull();
    expect(result!.id).toBeDefined();
    expect(result!.company_name).toEqual('Green Thumb Services');
    expect(result!.email).toEqual('contact@greenthumb.com');
    expect(result!.phone).toEqual('555-0123');
    expect(result!.address).toEqual('456 Garden Ave');
    expect(result!.website).toEqual('https://greenthumb.com');
    expect(result!.is_active).toEqual(true);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return first active company contact when multiple exist', async () => {
    // Create multiple active company contacts
    await db.insert(companyContactTable)
      .values([
        {
          company_name: 'First Company',
          email: 'first@example.com',
          phone: '555-0001',
          address: '123 First St',
          website: 'https://first.com',
          is_active: true
        },
        {
          company_name: 'Second Company',
          email: 'second@example.com',
          phone: '555-0002',
          address: '456 Second Ave',
          website: 'https://second.com',
          is_active: true
        }
      ])
      .execute();

    const result = await getCompanyContact();

    expect(result).not.toBeNull();
    expect(result!.company_name).toEqual('First Company');
    expect(result!.email).toEqual('first@example.com');
    expect(result!.is_active).toEqual(true);
  });

  it('should return active company contact even when inactive ones exist', async () => {
    // Create inactive company contact first
    await db.insert(companyContactTable)
      .values({
        company_name: 'Inactive Company',
        email: 'inactive@example.com',
        phone: '555-0001',
        address: '123 Inactive St',
        website: 'https://inactive.com',
        is_active: false
      })
      .execute();

    // Create active company contact
    await db.insert(companyContactTable)
      .values({
        company_name: 'Active Company',
        email: 'active@example.com',
        phone: '555-0002',
        address: '456 Active Ave',
        website: 'https://active.com',
        is_active: true
      })
      .execute();

    const result = await getCompanyContact();

    expect(result).not.toBeNull();
    expect(result!.company_name).toEqual('Active Company');
    expect(result!.email).toEqual('active@example.com');
    expect(result!.is_active).toEqual(true);
  });

  it('should handle company contact with nullable fields', async () => {
    // Create company contact with null optional fields
    await db.insert(companyContactTable)
      .values({
        company_name: 'Minimal Company',
        email: 'minimal@example.com',
        phone: null,
        address: null,
        website: null,
        is_active: true
      })
      .execute();

    const result = await getCompanyContact();

    expect(result).not.toBeNull();
    expect(result!.company_name).toEqual('Minimal Company');
    expect(result!.email).toEqual('minimal@example.com');
    expect(result!.phone).toBeNull();
    expect(result!.address).toBeNull();
    expect(result!.website).toBeNull();
    expect(result!.is_active).toEqual(true);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should verify database state after query', async () => {
    // Create test company contact
    const insertResult = await db.insert(companyContactTable)
      .values({
        company_name: 'Test Company',
        email: 'test@example.com',
        phone: '555-0123',
        address: '789 Test Blvd',
        website: 'https://test.com',
        is_active: true
      })
      .returning()
      .execute();

    const result = await getCompanyContact();

    // Verify the handler returns the same data as the database
    const dbRecord = await db.select()
      .from(companyContactTable)
      .where(eq(companyContactTable.id, result!.id))
      .execute();

    expect(dbRecord).toHaveLength(1);
    expect(dbRecord[0].company_name).toEqual(result!.company_name);
    expect(dbRecord[0].email).toEqual(result!.email);
    expect(dbRecord[0].phone).toEqual(result!.phone);
    expect(dbRecord[0].address).toEqual(result!.address);
    expect(dbRecord[0].website).toEqual(result!.website);
    expect(dbRecord[0].is_active).toEqual(result!.is_active);
  });
});