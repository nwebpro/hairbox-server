import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
dotenv.config()
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb'

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

// Database Collection
const Services = client.db('onlineBasketDb').collection('services')

// All Api Create Below

// Service Create Api
app.post('/api/online-basket/services', async (req, res) => {
    try {
        const services = await Services.insertOne(req.body)
        if(services.insertedId) {
            res.send({
                success: true,
                message: 'Service created successfully!'
            })
        }else{
            res.send({
                success: false,
                error: "Couldn't create service!"
            })
        }
    } catch (error) {
        console.log(error.name, error.message)
        res.send({
            success: false,
            error: error.message
        }) 
    }
})

// Home Page Service Get Api
app.get('/api/online-basket/services', async (req, res) => {
    try {
        const cursor = Services.find({})
        const services = await cursor.limit(3).toArray()
        res.send({
            success: true,
            message: 'Successfully got the all services data',
            data: services
        })
    } catch (error) {
        console.log(error.name, error.message)
        res.send({
            success: false,
            error: error.message
        })
    }
})

// Get All services
app.get('/api/online-basket/all-services', async (req, res) => {
    try {
        const cursor = Services.find({})
        const services = await cursor.toArray()
        res.send({
            success: true,
            message: 'Successfully got the all services data',
            data: services
        })
    } catch (error) {
        console.log(error.name, error.message)
        res.send({
            success: false,
            error: error.message
        })
    }
})

// Single Service Get Api with Id
app.get('/api/online-basket/service/:serviceDetailId', async (req, res) => {
    try {
        const serviceDetailId = req.params.serviceDetailId
        const query = { _id: ObjectId(serviceDetailId) }
        const services = await Services.findOne(query)
        res.send({
            success: true,
            message: 'Successfully got the each service data with services id',
            data: services
        })
    } catch (error) {
        console.log(error.name, error.message)
        res.send({
            success: false,
            error: error.message
        })     
    }
})


app.listen(port, () => {
    console.log(`Online Basket Server Running on Port ${port}`)
})