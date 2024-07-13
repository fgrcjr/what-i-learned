import { Router } from 'express'
import { query, validationResult, checkSchema, matchedData } from 'express-validator'
import { createUserValidationSchema } from '../utils/validationSchemas.mjs'
import { sampleUsers } from '../utils/constants.mjs'
import { resolveIndexByUserId } from '../utils/middlewares.mjs'
import { User } from '../mongoose/schemas/user.mjs'
import { hashPassword } from '../utils/helpers.mjs'
import { createUserHandler, getUserByIdHandler } from '../handlers/users.mjs'

const router = Router()

router.get('/api/users', 
    query('filter')
        .isString()
        .notEmpty()
        .withMessage("Must not be empty")
        .isLength({ min: 3, max: 32})
        .withMessage("Must be at least 3-32 characters")
    , (request, response) => { 
        console.log(request.session.id)  
        request.sessionStore.get(request.session.id, (err, sessionData) => {
            if(err){
                console.log(err)
                throw(err)
            }
            console.log("Inside Session Store Get")
            console.log(sessionData)
        })
        const result = validationResult(request)
        console.log(result)
        
        const { 
            query: { filter, value },
        } = request

        
        if(filter && value)
            return response.send(
                sampleUsers.filter((user) => user[filter].includes(value))
            )

        // When filter and value are undefined
        return response.send(sampleUsers)
        
})

router.get('/api/users/:id', resolveIndexByUserId, getUserByIdHandler)

router.post('/api/users', checkSchema(createUserValidationSchema), createUserHandler)


router.put('/api/users/:id', resolveIndexByUserId, (request, response) => {
    const { body, findUserIndex } = request
    sampleUsers[findUserIndex] = { id: sampleUsers[findUserIndex].id, ...body}
    return response.sendStatus(200) 
})

router.patch('/api/users/:id', resolveIndexByUserId,(request, response) => {
    const { body, findUserIndex } = request
    sampleUsers[findUserIndex] = { ...sampleUsers[findUserIndex], ...body}
    return response.sendStatus(200)
})

router.delete('/api/users/:id',(request, response) => {
    const { findUserIndex } = request
    sampleUsers.splice(findUserIndex, 1)
    return response.sendStatus(200)
})


export default router