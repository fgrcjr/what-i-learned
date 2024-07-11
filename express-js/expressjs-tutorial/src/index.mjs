import express from 'express'
import routes from './routes/index.mjs'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'
import mongoose from 'mongoose'
import MongoStore from 'connect-mongo'
// import "./strategies/local-strategy.mjs"

const app = express()

mongoose
    .connect('mongodb://localhost/express_tutorial')
    .then(() => console.log("Connected to Database"))
    .catch((err) => console.log(`Error ${err}`))

// Register Middleware
app.use(express.json())
app.use(cookieParser())
app.use(session({
    secret: 'test session',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 60000 * 60
    },
    store: MongoStore.create({
        client: mongoose.connection.getClient()
    }),
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(routes)


app.post('/api/auth', passport.authenticate('local'), (request, response) => {
    response.sendStatus(200)
}) 

app.get('/api/auth/status', (request, response) => {
    console.log(`Inside /auth/status endpoint`)
    console.log(request.user)

    return request.user ? response.send(request.user) : response.sendStatus(401)
})

app.post('/api/auth/logout', (request, response) => {
    if(!request.user) return response.sendStatus(401)

    request.logout((err) => {
        if(err) return response.sendStatus(400)
        response.send(200)
    })    
})

// Assuming that env has a port else use 3000
const PORT = process.env.PORT || 3000


// Listen for a PORT
app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`)
})