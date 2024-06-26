const express = require("express")

const app = express()

app.get("/wee", (request, response) => {
    response.status(200).json({ msg: "uuh hi?" });
})

const port = 5000
app.listen(port, () => {
    console.log(`Running on PORT ${port}`)
})