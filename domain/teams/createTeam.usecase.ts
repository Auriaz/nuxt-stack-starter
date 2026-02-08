import type { TeamsRepository } from '~~/server/repositories/teams.repo'

export async function createTeamUseCase(
  ownerId: number,
  input: { name: string, slug?: string | null },
  teamsRepository: TeamsRepository
) {
  const team = await teamsRepository.createTeam({
    name: input.name,
    slug: input.slug ?? null,
    ownerId
  })

  await teamsRepository.createMember({
    teamId: team.id,
    userId: ownerId,
    role: 'owner'
  })

  return team
}
