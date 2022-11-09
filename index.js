import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
dotenv.config()
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb'

const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())


app.get('/api/hairbox', (req, res) => {
    res.send('Hairbox Server Side Running')
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
dbConnect().catch(error => console.log(error.message))

// Database Collection
const Services = client.db('onlineBasketDb').collection('services')
const Reviews = client.db('onlineBasketDb').collection('reviews')

// Verify 2 step and 3rd step order display api JWT Token
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if(!authHeader) {
        return res.status(401).send({
            success: false,
            message: 'Unauthorized Access!'
        })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
        if(err) {
            return res.status(403).send({
                success: false,
                message: 'Forbidden Access!'
            })
        }
        req.decoded = decoded
        next()
    })

}

// JWT Token Api
app.post('/api/hairbox/jwt', (req, res) => {
    try {
        const user = req.body
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
        res.send({
            success: true,
            message: 'Successfully JWT Token Generate!',
            data: token
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// Service Create Api
app.post('/api/hairbox/services', async (req, res) => {
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
        res.send({
            success: false,
            error: error.message
        }) 
    }
})

// Home Page Service Get Api
app.get('/api/hairbox/services', async (req, res) => {
    try {
        const cursor = Services.find({}).sort('date', -1)
        const services = await cursor.limit(3).toArray()
        res.send({
            success: true,
            message: 'Successfully got the latest 3 services data',
            data: services
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// Get All services
app.get('/api/hairbox/all-services', async (req, res) => {
    try {
        const cursor = Services.find({}).sort('date', -1)
        const services = await cursor.toArray()
        res.send({
            success: true,
            message: 'Successfully got the all services data',
            data: services
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// Single Service Get Api with Id
app.get('/api/hairbox/service/:serviceId', async (req, res) => {
    try {
        const serviceId = req.params.serviceId
        const query = { _id: ObjectId(serviceId) }
        const services = await Services.findOne(query)
        res.send({
            success: true,
            message: 'Successfully got the each service data with services id',
            data: services
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })     
    }
})

// All Review Api Below
app.post('/api/hairbox/reviews', async (req, res) => {
    try {
        const reviews = await Reviews.insertOne(req.body)
        if(reviews.insertedId) {
            res.send({
                success: true,
                message: 'Review created successfully!'
            })
        }else{
            res.send({
                success: false,
                error: "Couldn't create review!"
            })
        }
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        }) 
    }
})

// Review Display with service id
app.get('/api/hairbox/all-review', async (req, res) => {
    try {
        let query = {}
        if(req.query.serviceId){
            query = {
                serviceId: req.query.serviceId
            }
        }
        const cursor = Reviews.find(query).sort('date', -1)
        const reviews = await cursor.toArray()
        res.send({
            success: true,
            message: 'Successfully got the all reviews data',
            data: reviews
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// Review Display with user email
app.get('/api/hairbox/review', verifyJWT, async (req, res) => {
    try {
        // Verify 3rd step JWT Token
        const decoded = req.decoded
        if(decoded.email !== req.query.email) {
            res.status(403).send({
                success: false,
                message: 'Forbidden Access!'
            })
        }

        let query = {}
        if(req.query.email){
            query = {
                userEmail: req.query.email
            }
        }
        const cursor = Reviews.find(query).sort('date', -1)
        const reviews = await cursor.toArray()
        res.send(reviews)
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// Single Review with id
app.get("/api/hairbox/review/:reviewId", async (req, res) => {
    try {
        const reviewId = req.params.reviewId
        const reviews = await Reviews.findOne({ _id: ObjectId(reviewId) })
        res.send({
            success: true,
            message: 'Successfully got the reviews data',
            data: reviews,
        });
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        });
    }
})

// Review Update
app.patch("/api/hairbox/review/:reviewId", verifyJWT, async (req, res) => {
    try {
        const reviewId = req.params.reviewId
        const reviews = await Reviews.updateOne({ _id: ObjectId(reviewId) }, { $set: req.body })

        if (reviews.matchedCount) {
            res.send({
                success: true,
                message: "Successfully updated the review",
            });
        } else {
            res.send({
                success: false,
                error: "Couldn't update  the review",
            });
        }
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        });
    }
})

// Review Deleted
app.delete('/api/hairbox/review/:reviewId', verifyJWT, async (req, res) => {
    try {
        const reviewId = req.params.reviewId
        const deleteReview = await Reviews.deleteOne({ _id: ObjectId(reviewId) })
        if(deleteReview.deletedCount) {
            res.send({
                success: true,
                message: 'Successfully deleted the review'
            })
        }
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        }) 
    }
})


app.listen(port, () => {
    console.log(`Hairbox Server Running on Port ${port}`)
})