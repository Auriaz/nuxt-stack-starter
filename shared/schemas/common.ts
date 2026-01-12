import { object, string, optional, boolean, array, picklist } from 'valibot'

export const ImageSchema = object({
  src: string(),
  alt: optional(string()),
})

export const SEOSchema = object({
  title: optional(string()),
  description: optional(string()),
  image: optional(string()),
  noindex: optional(boolean()),
  ogType: optional(picklist(['website', 'article', 'profile'] as const)),
  publishedTime: optional(string()),
  modifiedTime: optional(string()),
  author: optional(string()),
  tags: optional(array(string())),
})
