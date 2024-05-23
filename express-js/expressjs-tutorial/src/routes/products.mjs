import { Router } from 'express'

const router = Router()

router.get('/api/products', (request, response) => {
    response.send([
        { id: 1, name: "bread", price: 24 }
    ])
})

export default router