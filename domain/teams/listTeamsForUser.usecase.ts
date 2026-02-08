import type { TeamsRepository } from '~~/server/repositories/teams.repo'

export async function listTeamsForUserUseCase(
  userId: number,
  teamsRepository: TeamsRepository
) {
  return await teamsRepository.listTeamsForUser(userId)
}
