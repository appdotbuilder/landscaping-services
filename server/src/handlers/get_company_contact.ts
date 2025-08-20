import { db } from '../db';
import { companyContactTable } from '../db/schema';
import { type CompanyContact } from '../schema';
import { eq } from 'drizzle-orm';

export async function getCompanyContact(): Promise<CompanyContact | null> {
  try {
    // Query for the first active company contact
    const result = await db.select()
      .from(companyContactTable)
      .where(eq(companyContactTable.is_active, true))
      .limit(1)
      .execute();

    // Return the first result or null if none found
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Failed to fetch company contact:', error);
    throw error;
  }
}