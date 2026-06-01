const usersByUsername = new Map()
const usersById = new Map()

export const findUserByUsername = (username) => usersByUsername.get(username.toLowerCase()) ?? null

export const findUserById = (id) => usersById.get(id) ?? null

export const createUser = (user) => {
  usersByUsername.set(user.username.toLowerCase(), user)
  usersById.set(user.id, user)
  return user
}

export const updateUser = (user) => {
  usersByUsername.set(user.username.toLowerCase(), user)
  usersById.set(user.id, user)
  return user
}

export const userCount = () => usersById.size
