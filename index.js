import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
dotenv.config()
import { MongoClient, ServerApiVersion } from 'mongodb'

const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())


app.get('/api/online-basket', (req, res) => {
    res.send('Online Basket Server Side Running')
})

// Mongodb Setup
const uri = `mongodb+srv://${ process.env.MONGODB_USERNAME }:${ process.env.MONGODB_PASSWORD }@cluster0.1ipuukw.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })
async function dbConnect() {
    try {
        await client.connect()
        console.log('Database Connected')
    } catch (error) {
        console.log(error.name, error.message)
    }
}
dbConnect()



app.listen(port, () => {
    console.log(`Genius Car Server Running on Port ${port}`)
})