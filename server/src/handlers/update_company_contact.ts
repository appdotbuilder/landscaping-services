import { db } from '../db';
import { companyContactTable } from '../db/schema';
import { type UpdateCompanyContactInput, type CompanyContact } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateCompanyContact(input: UpdateCompanyContactInput): Promise<CompanyContact | null> {
  try {
    const { id, ...updateData } = input;
    
    // Set updated_at to current timestamp
    const updateValues = {
      ...updateData,
      updated_at: new Date()
    };

    // Update the company contact record
    const result = await db.update(companyContactTable)
      .set(updateValues)
      .where(eq(companyContactTable.id, id))
      .returning()
      .execute();

    // Return null if no record was found/updated
    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Company contact update failed:', error);
    throw error;
  }
}