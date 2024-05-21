import express from 'express'
import { query, validationResult, body, matchedData, checkSchema } from 'express-validator'
import { createUserValidationSchema } from './utils/validationSchemas.mjs'
import { getUsers } from './utils/validationSchemas.mjs'

const app = express()

// Register Middleware
app.use(express.json())

// Sample Middleware function
const loggingMiddleware = (request, reponse, next) => {
    console.log(`${request.method} - ${request.url}`)
    next()
}

const resolveIndexByUserId = (request, response, next) => {
    const { body, params:{ id } } = request
    const parseId = parseInt(id)
    if (isNaN(parseId)) return response.sendStatus(400)

    const findUserIndex = sampleUsers.findIndex((user) => user.id === parseId)
    if(findUserIndex === -1) return response.sendStatus(404)
    request.findUserIndex = findUserIndex
    next()
}

// Always register the middleware before all endpoints
app.use(loggingMiddleware)

// Assuming that env has a port else use 3000
const PORT = process.env.PORT || 3000

const sampleUsers = [
    { id: 1, username: "wee", displayName: "Weee" },
    { id: 2, username: "bebe", displayName: "Bebe" },
    { id: 3, username: "test", displayName: "Testing" },
    { id: 4, username: "duck", displayName: "Duck" },
    { id: 5, username: "turtle", displayName: "Turtle" },
    { id: 6, username: "8bitdo", displayName: "8BitDo" },
    { id: 7, username: "nsw", displayName: "Switch" },
]

// GET Requests
// Use '/api/{}'
// to get status "response.status(200)"
app.get('/', 
    (request, response,next) => {
        console.log("test 1")
        next()
    },
    (request, response,next) => {
        console.log("test 2")
        next()
    }, 
    (request, response) => {
    return response.status(201).send({ msg: "Hello"})
    }
)

// Query Params
// sample_1: ?key=value&key2=value2
// sample_2: //localhost:3000/api/users?filter=username&value=test
// Use of express-validator, act as middleware
app.get('/api/users', checkSchema(getUsers), (request, response) => {

    console.log(request.query)
    response.status(200)

    const result = validationResult(request)
    console.log(result)

    const test = matchedData(request)
    console.log(test)

    // de-structure the query
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

// POST Requests
app.post('/api/users', checkSchema(createUserValidationSchema), (request, response) => {
    console.log(request.body)

    const result = validationResult(request)
    console.log(result)

    if (!result.isEmpty())
        return response.status(400).send({ errors: result.array() })

    const data = matchedData(request)
    const newUser = { id: sampleUsers[sampleUsers.length - 1].id + 1, ...data}
    sampleUsers.push(newUser)
    return response.status(201).send(newUser)
})


// Route Params
// use console.log(request,params) to check what can be used as params
// app.get('/api/users/:id', (request, response) => {
//     // create validation
//     console.log(request.params)
//     const parseId = parseInt(request.params.id)
//     console.log(parseId)

//     if(isNaN(parseId)) return response.status(400).send({ msg: "Bad request. Invalid ID."})

//     const findUser = sampleUsers.find((user) => user.id === parseId)
//     if (!findUser) return response.sendStatus(404)
//     return response.send(findUser)
// })

// apply middleware for GET Request, Route Params
app.get('/api/users/:id', resolveIndexByUserId, (request, response) => {
    const { findUserIndex } = request
    const findUser = sampleUsers[findUserIndex]
    if (!findUser) return response.sendStatus(404)
    return response.send(findUser)
})


// PUT Request
// Update entire entity
// app.put('/api/users/:id', (request, response) => {
//     const { body, params:{ id } } = request
//     const parseId = parseInt(id)
//     if (isNaN(parseId)) return response.sendStatus(400)

//     const findUserIndex = sampleUsers.findIndex((user) => user.id === parseId)
//     if(findUserIndex === -1) return response.sendStatus(404)

//     sampleUsers[findUserIndex] = { id: parseId, ...body}
//     return response.sendStatus(200)
// })

// apply middleware for PUT Request
app.put('/api/users/:id', resolveIndexByUserId, (request, response) => {
    const { body, findUserIndex } = request
    sampleUsers[findUserIndex] = { id: sampleUsers[findUserIndex].id, ...body}
    return response.sendStatus(200) 
})

// PATCH Request
// Updates specific entity
// app.patch('/api/users/:id', (request, response) => {
//     const { body, params:{ id } } = request
//     const parseId = parseInt(id)
//     if (isNaN(parseId)) return response.sendStatus(400)

//     const findUserIndex = sampleUsers.findIndex((user) => user.id === parseId)
//     if(findUserIndex === -1) return response.sendStatus(404)

//     // Take all the current values of sampleUsers by ...sampleUsers
//     // Then request body add the value on ...body to override value of sampleUsers
//     sampleUsers[findUserIndex] = { ...sampleUsers[findUserIndex], ...body}
//     return response.sendStatus(200)
// })

// apply middleware for PATCH Request
app.patch('/api/users/:id', resolveIndexByUserId,(request, response) => {
    const { body, findUserIndex } = request
    sampleUsers[findUserIndex] = { ...sampleUsers[findUserIndex], ...body}
    return response.sendStatus(200)
})

// DELETE Request
// app.delete('/api/users/:id',(request, response) => {
//     const { params: { id }} = request
//     const parseId = parseInt(id)
//     if (isNaN(parseId)) return response.sendStatus(400)

//     // get index then splice
//     const findUserIndex = sampleUsers.findIndex((user) => user.id === parseId)
//     if (findUserIndex === -1) return response.sendStatus(404)
    
//     sampleUsers.splice(findUserIndex, 1)
//     return response.sendStatus(200)
// })

// apply middleware for DELETE Request
app.delete('/api/users/:id',(request, response) => {
    const { findUserIndex } = request
    sampleUsers.splice(findUserIndex, 1)
    return response.sendStatus(200)
})


app.get('/api/products', (request, response) => {
    response.send([
        { id: 1, name: "bread", price: 24 }
    ])
})


// Listen for a PORT
app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`)
})