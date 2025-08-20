import { serial, text, pgTable, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Service type enum
export const serviceTypeEnum = pgEnum('service_type', [
  'gardening',
  'shoveling', 
  'tree_care',
  'snowblowing',
  'lawnmowing'
]);

// Services table
export const servicesTable = pgTable('services', {
  id: serial('id').primaryKey(),
  type: serviceTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  display_order: integer('display_order').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Photos table
export const photosTable = pgTable('photos', {
  id: serial('id').primaryKey(),
  service_id: integer('service_id').notNull().references(() => servicesTable.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  alt_text: text('alt_text').notNull(),
  display_order: integer('display_order').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Company contact table
export const companyContactTable = pgTable('company_contact', {
  id: serial('id').primaryKey(),
  company_name: text('company_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  address: text('address'),
  website: text('website'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const servicesRelations = relations(servicesTable, ({ many }) => ({
  photos: many(photosTable),
}));

export const photosRelations = relations(photosTable, ({ one }) => ({
  service: one(servicesTable, {
    fields: [photosTable.service_id],
    references: [servicesTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Service = typeof servicesTable.$inferSelect;
export type NewService = typeof servicesTable.$inferInsert;
export type Photo = typeof photosTable.$inferSelect;
export type NewPhoto = typeof photosTable.$inferInsert;
export type CompanyContact = typeof companyContactTable.$inferSelect;
export type NewCompanyContact = typeof companyContactTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = { 
  services: servicesTable, 
  photos: photosTable, 
  companyContact: companyContactTable 
};