import { sampleUsers } from "./constants.mjs"

export const resolveIndexByUserId = (request, response, next) => {
    const { body, params:{ id } } = request
    const parseId = parseInt(id)
    if (isNaN(parseId)) return response.sendStatus(400)

    const findUserIndex = sampleUsers.findIndex((user) => user.id === parseId)
    if(findUserIndex === -1) return response.sendStatus(404)
    request.findUserIndex = findUserIndex
    next()
}
