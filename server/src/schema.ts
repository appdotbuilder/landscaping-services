import { z } from 'zod';

// Service types enum
export const serviceTypeSchema = z.enum([
  'gardening',
  'shoveling',
  'tree_care',
  'snowblowing',
  'lawnmowing'
]);

export type ServiceType = z.infer<typeof serviceTypeSchema>;

// Photo schema
export const photoSchema = z.object({
  id: z.number(),
  service_id: z.number(),
  url: z.string().url(),
  alt_text: z.string(),
  display_order: z.number().int(),
  created_at: z.coerce.date()
});

export type Photo = z.infer<typeof photoSchema>;

// Service schema
export const serviceSchema = z.object({
  id: z.number(),
  type: serviceTypeSchema,
  title: z.string(),
  description: z.string(),
  is_active: z.boolean(),
  display_order: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Service = z.infer<typeof serviceSchema>;

// Company contact schema
export const companyContactSchema = z.object({
  id: z.number(),
  company_name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  website: z.string().url().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type CompanyContact = z.infer<typeof companyContactSchema>;

// Input schema for creating services
export const createServiceInputSchema = z.object({
  type: serviceTypeSchema,
  title: z.string(),
  description: z.string(),
  is_active: z.boolean().default(true),
  display_order: z.number().int().nonnegative()
});

export type CreateServiceInput = z.infer<typeof createServiceInputSchema>;

// Input schema for updating services
export const updateServiceInputSchema = z.object({
  id: z.number(),
  type: serviceTypeSchema.optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
  display_order: z.number().int().nonnegative().optional()
});

export type UpdateServiceInput = z.infer<typeof updateServiceInputSchema>;

// Input schema for creating photos
export const createPhotoInputSchema = z.object({
  service_id: z.number(),
  url: z.string().url(),
  alt_text: z.string(),
  display_order: z.number().int().nonnegative()
});

export type CreatePhotoInput = z.infer<typeof createPhotoInputSchema>;

// Input schema for updating photos
export const updatePhotoInputSchema = z.object({
  id: z.number(),
  service_id: z.number().optional(),
  url: z.string().url().optional(),
  alt_text: z.string().optional(),
  display_order: z.number().int().nonnegative().optional()
});

export type UpdatePhotoInput = z.infer<typeof updatePhotoInputSchema>;

// Input schema for updating company contact
export const updateCompanyContactInputSchema = z.object({
  id: z.number(),
  company_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  is_active: z.boolean().optional()
});

export type UpdateCompanyContactInput = z.infer<typeof updateCompanyContactInputSchema>;

// Service with photos schema (for frontend display)
export const serviceWithPhotosSchema = z.object({
  id: z.number(),
  type: serviceTypeSchema,
  title: z.string(),
  description: z.string(),
  is_active: z.boolean(),
  display_order: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  photos: z.array(photoSchema)
});

export type ServiceWithPhotos = z.infer<typeof serviceWithPhotosSchema>;