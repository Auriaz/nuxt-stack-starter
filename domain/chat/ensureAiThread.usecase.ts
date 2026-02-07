import type { ChatRepository, ChatThreadRecord } from '../../server/repositories/chat.repo'
import type { UserRepository } from '../../server/repositories/user.repo'

const AI_BOT_EMAIL = 'ai-bot@local'
const AI_BOT_USERNAME = 'ai-bot'
const AI_BOT_PASSWORD = 'disabled'

const AI_THREAD_TOPICS: Array<{ slug: string, label: string, order: number }> = [
  { slug: 'onboarding', label: 'Onboarding', order: 1 },
  { slug: 'content-planning', label: 'Content planning', order: 2 },
  { slug: 'seo', label: 'SEO', order: 3 },
  { slug: 'ui-ux-motion', label: 'UI/UX & Motion', order: 4 },
  { slug: 'backend-api', label: 'Backend & API', order: 5 },
  { slug: 'auth-rbac', label: 'Auth/RBAC', order: 6 },
  { slug: 'media-assets', label: 'Media & Assets', order: 7 },
  { slug: 'analytics', label: 'Analytics', order: 8 }
]

async function ensureAiBotUser(userRepository: UserRepository) {
  const existing = await userRepository.findByEmail(AI_BOT_EMAIL)
  if (existing) return existing
  return await userRepository.create({
    email: AI_BOT_EMAIL,
    username: AI_BOT_USERNAME,
    password: AI_BOT_PASSWORD
  })
}

export async function ensureAiThreadForUser(
  userId: number,
  chatRepository: ChatRepository,
  userRepository: UserRepository
): Promise<ChatThreadRecord> {
  const aiBotUser = await ensureAiBotUser(userRepository)
  const existing = await chatRepository.findAiThreadByUserId(userId)

  if (existing) {
    const userParticipant = await chatRepository.findParticipant(existing.id, userId)
    if (!userParticipant) {
      await chatRepository.createParticipant({ threadId: existing.id, userId, role: 'owner' })
    }

    const botParticipant = await chatRepository.findParticipant(existing.id, aiBotUser.id)
    if (!botParticipant) {
      await chatRepository.createParticipant({ threadId: existing.id, userId: aiBotUser.id, role: 'assistant' })
    }

    const topics = await chatRepository.listTopicsByThread(existing.id)
    if (topics.length === 0) {
      await chatRepository.createTopics(existing.id, AI_THREAD_TOPICS)
    }

    return existing
  }

  const thread = await chatRepository.createThread({
    type: 'ai',
    title: 'AI Assistant',
    createdById: userId
  })

  await chatRepository.createParticipant({ threadId: thread.id, userId, role: 'owner' })
  await chatRepository.createParticipant({ threadId: thread.id, userId: aiBotUser.id, role: 'assistant' })
  await chatRepository.createTopics(thread.id, AI_THREAD_TOPICS)

  return thread
}
