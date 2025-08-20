import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { companyContactTable } from '../db/schema';
import { type UpdateCompanyContactInput } from '../schema';
import { updateCompanyContact } from '../handlers/update_company_contact';
import { eq } from 'drizzle-orm';

describe('updateCompanyContact', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a test company contact
  const createTestContact = async () => {
    const result = await db.insert(companyContactTable)
      .values({
        company_name: 'Test Company',
        email: 'test@company.com',
        phone: '555-0123',
        address: '123 Test St',
        website: 'https://testcompany.com',
        is_active: true
      })
      .returning()
      .execute();
    
    return result[0];
  };

  it('should update all fields of a company contact', async () => {
    const contact = await createTestContact();
    const originalUpdatedAt = contact.updated_at;
    
    // Wait a moment to ensure updated_at timestamp is different
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateCompanyContactInput = {
      id: contact.id,
      company_name: 'Updated Company',
      email: 'updated@company.com',
      phone: '555-9999',
      address: '456 Updated Ave',
      website: 'https://updatedcompany.com',
      is_active: false
    };

    const result = await updateCompanyContact(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(contact.id);
    expect(result!.company_name).toBe('Updated Company');
    expect(result!.email).toBe('updated@company.com');
    expect(result!.phone).toBe('555-9999');
    expect(result!.address).toBe('456 Updated Ave');
    expect(result!.website).toBe('https://updatedcompany.com');
    expect(result!.is_active).toBe(false);
    expect(result!.created_at).toEqual(contact.created_at);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should update only specified fields', async () => {
    const contact = await createTestContact();

    const updateInput: UpdateCompanyContactInput = {
      id: contact.id,
      company_name: 'Partially Updated Company',
      is_active: false
    };

    const result = await updateCompanyContact(updateInput);

    expect(result).not.toBeNull();
    expect(result!.company_name).toBe('Partially Updated Company');
    expect(result!.is_active).toBe(false);
    // Other fields should remain unchanged
    expect(result!.email).toBe(contact.email);
    expect(result!.phone).toBe(contact.phone);
    expect(result!.address).toBe(contact.address);
    expect(result!.website).toBe(contact.website);
  });

  it('should handle nullable fields correctly', async () => {
    const contact = await createTestContact();

    const updateInput: UpdateCompanyContactInput = {
      id: contact.id,
      phone: null,
      address: null,
      website: null
    };

    const result = await updateCompanyContact(updateInput);

    expect(result).not.toBeNull();
    expect(result!.phone).toBeNull();
    expect(result!.address).toBeNull();
    expect(result!.website).toBeNull();
    // Non-nullable fields should remain unchanged
    expect(result!.company_name).toBe(contact.company_name);
    expect(result!.email).toBe(contact.email);
  });

  it('should return null for non-existent company contact', async () => {
    const updateInput: UpdateCompanyContactInput = {
      id: 999999, // Non-existent ID
      company_name: 'Should Not Update'
    };

    const result = await updateCompanyContact(updateInput);

    expect(result).toBeNull();
  });

  it('should update the record in the database', async () => {
    const contact = await createTestContact();

    const updateInput: UpdateCompanyContactInput = {
      id: contact.id,
      company_name: 'Database Updated Company',
      email: 'database@updated.com'
    };

    await updateCompanyContact(updateInput);

    // Verify the update was persisted in the database
    const updatedContact = await db.select()
      .from(companyContactTable)
      .where(eq(companyContactTable.id, contact.id))
      .execute();

    expect(updatedContact).toHaveLength(1);
    expect(updatedContact[0].company_name).toBe('Database Updated Company');
    expect(updatedContact[0].email).toBe('database@updated.com');
    expect(updatedContact[0].updated_at).toBeInstanceOf(Date);
    expect(updatedContact[0].updated_at.getTime()).toBeGreaterThan(contact.updated_at.getTime());
  });

  it('should update only the updated_at timestamp when no other fields are provided', async () => {
    const contact = await createTestContact();
    const originalUpdatedAt = contact.updated_at;
    
    // Wait a moment to ensure updated_at timestamp is different
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateCompanyContactInput = {
      id: contact.id
    };

    const result = await updateCompanyContact(updateInput);

    expect(result).not.toBeNull();
    expect(result!.company_name).toBe(contact.company_name);
    expect(result!.email).toBe(contact.email);
    expect(result!.phone).toBe(contact.phone);
    expect(result!.address).toBe(contact.address);
    expect(result!.website).toBe(contact.website);
    expect(result!.is_active).toBe(contact.is_active);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should handle email updates correctly', async () => {
    const contact = await createTestContact();

    const updateInput: UpdateCompanyContactInput = {
      id: contact.id,
      email: 'newemail@company.com'
    };

    const result = await updateCompanyContact(updateInput);

    expect(result).not.toBeNull();
    expect(result!.email).toBe('newemail@company.com');
    
    // Verify in database
    const dbContact = await db.select()
      .from(companyContactTable)
      .where(eq(companyContactTable.id, contact.id))
      .execute();

    expect(dbContact[0].email).toBe('newemail@company.com');
  });
});