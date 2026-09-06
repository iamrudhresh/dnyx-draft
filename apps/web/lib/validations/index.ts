import { z } from 'zod';

export const documentSchema = z.object({
  title: z.string().min(1, 'Document title is required').max(100),
  content: z.string(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
});

export const githubImportSchema = z.object({
  url: z
    .string()
    .url('Please enter a valid URL')
    .regex(
      /github\.com|raw\.githubusercontent\.com/,
      'Must be a GitHub repository or raw markdown URL',
    ),
});

export const shareSnapshotSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1, 'Cannot share empty document'),
  expiresInDays: z.number().min(1).max(90).default(30),
});

export type DocumentInput = z.infer<typeof documentSchema>;
export type GitHubImportInput = z.infer<typeof githubImportSchema>;
export type ShareSnapshotInput = z.infer<typeof shareSnapshotSchema>;
