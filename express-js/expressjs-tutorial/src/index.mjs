import express from 'express'
import routes from './routes/index.mjs'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import { sampleUsers } from './utils/constants.mjs'

const app = express()

// Register Middleware
app.use(express.json())
app.use(cookieParser())
app.use(session({
    secret: 'test session',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 60000 * 60
    }
}))
app.use(routes)


// Assuming that env has a port else use 3000
const PORT = process.env.PORT || 3000

// GET Requests
// Use '/api/{}'
// to get status "response.status(200)"
app.get('/', (request, response) => {
    console.log(request.session)
    console.log(request.session.id)
    request.session.visited = true
    response.cookie('hello', 'world', { maxAge: 60000 })
    return response.status(201).send({ msg: "Hello"})
    }
)

app.post('/api/auth', (request, response) => {
    const { body: { username, password } } = request
    const findUser = sampleUsers.find((user) => user.username === username)
    if(!findUser || findUser.password !== password) 
        return response.status(401).send({ msg: "Invalid Credentials" }) 
    request.session.user = findUser
    return response.status(200).send(findUser)
})

// Listen for a PORT
app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`)
})