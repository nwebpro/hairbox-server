import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())


app.get('/api/online-basket', (req, res) => {
    res.send('Online Basket Server Side Running')
})



app.listen(port, () => {
    console.log(`Genius Car Server Running on Port ${port}`)
})