import { Router } from 'express'

const router = Router()

router.get('/api/products', (request, response) => {
    console.log(request.headers.cookie)
    if(request.cookies.hello && request.cookies.hello === "world")
        return response.send([{ id: 1, name: "bread", price: 24 }])
    return response.send({ msg: "Sorry. You need the correct cookie" })
})

export default router