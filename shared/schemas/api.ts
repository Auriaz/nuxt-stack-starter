import { object, string, pipe, minLength, email, optional, boolean } from 'valibot'

export const ContactFormSchema = object({
  name: pipe(string(), minLength(2, 'Imię i nazwisko musi mieć co najmniej 2 znaki')),
  email: pipe(string(), email('Nieprawidłowy adres email')),
  phone: optional(string()),
  subject: pipe(string(), minLength(3, 'Temat musi mieć co najmniej 3 znaki')),
  message: pipe(string(), minLength(10, 'Wiadomość musi mieć co najmniej 10 znaków'))
})

export const NewsletterSubscribeSchema = object({
  email: pipe(string(), email('Nieprawidłowy adres email')),
  consent: optional(boolean())
})

export const CreatePostRequestSchema = object({
  title: string(),
  content: string(),
  authorId: string()
})

export const PostResponseSchema = object({
  id: string(),
  title: string(),
  content: string(),
  authorId: string(),
  createdAt: string()
})
