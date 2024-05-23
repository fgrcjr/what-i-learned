import express from 'express'
import routes from './routes/index.mjs'

const app = express()

// Register Middleware
app.use(express.json())
app.use(routes)


// Assuming that env has a port else use 3000
const PORT = process.env.PORT || 3000

// GET Requests
// Use '/api/{}'
// to get status "response.status(200)"
app.get('/', (request, response) => {
    return response.status(201).send({ msg: "Hello"})
    }
)

// Listen for a PORT
app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`)
})