import { PERMISSIONS } from '#shared/permissions'
import type { ChatParticipantRecord, ChatRepository, ChatThreadRecord } from '~~/server/repositories/chat.repo'
import type { FriendsRepository } from '~~/server/repositories/friends.repo'
import type { TeamsRepository } from '~~/server/repositories/teams.repo'
import { ChatAccessDeniedError, ChatThreadNotFoundError } from './errors'

export type ChatAccessAction = 'read' | 'write' | 'join'

function hasPermission(permissions: string[], key: string, fallback?: string) {
  if (permissions.includes(key)) return true
  if (fallback && permissions.includes(fallback)) return true
  return false
}

async function ensureTeamParticipant(
  thread: ChatThreadRecord,
  userId: number,
  chatRepository: ChatRepository
): Promise<ChatParticipantRecord> {
  const existing = await chatRepository.findParticipant(thread.id, userId)
  if (existing) return existing
  return await chatRepository.createParticipant({ threadId: thread.id, userId, role: 'member' })
}

export async function assertCanAccessThreadUseCase(
  params: { userId: number, threadId: number, permissions: string[], action: ChatAccessAction },
  deps: { chatRepository: ChatRepository, friendsRepository: FriendsRepository, teamsRepository: TeamsRepository }
): Promise<{ thread: ChatThreadRecord, participant?: ChatParticipantRecord, dmOtherUserId?: number }> {
  const thread = await deps.chatRepository.findThreadById(params.threadId)
  if (!thread) throw new ChatThreadNotFoundError()

  if (!hasPermission(params.permissions, PERMISSIONS.CHAT_USE)) {
    throw new ChatAccessDeniedError('Chat access denied')
  }

  if (thread.type === 'ai') {
    if (!hasPermission(params.permissions, PERMISSIONS.CHAT_AI_USE, PERMISSIONS.CHAT_USE)) {
      throw new ChatAccessDeniedError('AI chat disabled')
    }

    const participant = await deps.chatRepository.findParticipant(thread.id, params.userId)
    if (!participant) throw new ChatAccessDeniedError('Not a participant')

    return { thread, participant }
  }

  if (thread.type === 'dm') {
    const participantIds = await deps.chatRepository.listParticipantUserIds(thread.id)
    if (!participantIds.includes(params.userId)) {
      throw new ChatAccessDeniedError('Not a participant')
    }

    const otherUserId = participantIds.find(id => id !== params.userId)
    if (!otherUserId) {
      throw new ChatAccessDeniedError('Missing DM participant')
    }

    const friendship = await deps.friendsRepository.findRequestBetweenUsers(params.userId, otherUserId)
    if (!friendship) {
      throw new ChatAccessDeniedError('Friendship required')
    }

    if (friendship.status === 'blocked') {
      throw new ChatAccessDeniedError('User blocked')
    }

    if (friendship.status !== 'accepted') {
      throw new ChatAccessDeniedError('Friendship required')
    }

    const participant = await deps.chatRepository.findParticipant(thread.id, params.userId)
    if (!participant) {
      throw new ChatAccessDeniedError('Not a participant')
    }

    return { thread, participant, dmOtherUserId: otherUserId }
  }

  if (thread.type === 'team') {
    if (!thread.teamId) {
      throw new ChatAccessDeniedError('Missing team context')
    }

    const member = await deps.teamsRepository.findMember(thread.teamId, params.userId)
    if (!member) {
      throw new ChatAccessDeniedError('Not a team member')
    }

    // Dla odczytu sprawdzamy CHAT_TEAM_READ
    if (params.action === 'read') {
      if (!hasPermission(params.permissions, PERMISSIONS.CHAT_TEAM_READ, PERMISSIONS.CHAT_USE)) {
        throw new ChatAccessDeniedError('Insufficient permissions')
      }
      const participant = await ensureTeamParticipant(thread, params.userId, deps.chatRepository)
      return { thread, participant }
    }

    // Dla zapisu sprawdzamy CHAT_TEAM_WRITE lub czy użytkownik jest członkiem wątku
    if (params.action === 'write') {
      // Jeśli użytkownik jest już uczestnikiem wątku (np. dodany do wydarzenia), może pisać
      const participant = await deps.chatRepository.findParticipant(thread.id, params.userId)
      if (participant) {
        return { thread, participant }
      }

      // W przeciwnym razie wymaga uprawnienia CHAT_TEAM_WRITE
      if (!hasPermission(params.permissions, PERMISSIONS.CHAT_TEAM_WRITE, PERMISSIONS.CHAT_USE)) {
        throw new ChatAccessDeniedError('Insufficient permissions')
      }

      const newParticipant = await ensureTeamParticipant(thread, params.userId, deps.chatRepository)
      return { thread, participant: newParticipant }
    }

    // Dla 'join' pozwalamy członkom zespołu dołączyć
    const participant = await ensureTeamParticipant(thread, params.userId, deps.chatRepository)
    return { thread, participant }
  }

  const participant = await deps.chatRepository.findParticipant(thread.id, params.userId)
  if (!participant) {
    throw new ChatAccessDeniedError('Not a participant')
  }

  return { thread, participant }
}
