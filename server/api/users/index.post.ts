export default defineEventHandler(async (event) => {
  const body = await readBody<{ username: string, email: string }>(event)

  const user = await prisma.user.create({
    data: {
      username: body.username,
      email: body.email
    }
  })

  return user
})
