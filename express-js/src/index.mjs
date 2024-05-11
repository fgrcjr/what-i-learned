import express from 'express'

const app = express()

// Assuming that env has a port else use 3000
const PORT = process.env.PORT || 3000

const sampleUsers = [
    { id: 1, username: "wee", displayName: "Weee" },
    { id: 2, username: "bebe", displayName: "Bebe" },
    { id: 3, username: "test", displayName: "Testing" }
]

// GET Requests
// Use '/api/{}'
app.get('/', (request, response)=> {
    response.status(201)
})

app.get('/api/users', (request, response) => {
    response.send(sampleUsers)
})

// Route Params
// use console.log(request,params) to check what can be used as params
app.get('/api/users/:id', (request, response) => {
    // create validation
    console.log(request.params)
    const parseId = parseInt(request.params.id)
    console.log(parseId)

    if(isNaN(parseId)) return response.status(400).send({ msg: "Bad request. Invalid ID."})

    const findUser = sampleUsers.find((user) => user.id === parseId)
    if (!findUser) return response.sendStatus(404)
    return response.send(findUser)
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