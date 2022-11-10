const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


// middleware
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3i8mx1l.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization
    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'})

    }
    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.ACCESS_TOKEN_SECTET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbidden'})
        }
        req.decoded =decoded
        next()
    })
}


async function run(){

    const serviceCollection = client.db('globeRouteTravels').collection('services')
    const reviewCollection = client.db('globeRouteTravels').collection('reviews')


    app.post('/jwt', (req, res)=>{
        const user = req.body
        // console.log(user);
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECTET, {expiresIn : '1h'} )
        res.send({token})
    })



    app.get('/homeservices', async (req, res)=>{
        const query = {}
        const cursor = serviceCollection.find(query)

        const services = await cursor.limit(3).toArray()
        res.send(services)
    })


    app.get('/services', async (req, res)=>{
        const query = {}
        const cursor = serviceCollection.find(query)

        const services = await cursor.toArray()
        res.send(services)
    })

    app.get('/services/:id', async (req, res)=>{
        const id = req.params.id
        const query = {_id: ObjectId(id)}
        const cursor = serviceCollection.find(query)

        const services = await cursor.toArray()
        res.send(services)
    })


    app.get('/reviews/:id', async (req, res)=>{
        const id = req.params.id
        const query = {serviceId : id}
        const cursor = reviewCollection.find(query)

        const reviews = await cursor.toArray()
         reviews.reverse()
        res.send(reviews)
    })


    app.get('/myreviews/:email', verifyJWT, async (req, res)=>{
        const decoded = req.decoded
        // console.log('inside decoded',decoded);
        const email = req.params.email
        if(decoded.email !== email){
            res.status(403).send('unauthorized access')
        }
        // console.log(email);
        const query = {email : email}
        const cursor = reviewCollection.find(query)

        const reviews = await cursor.toArray()
         reviews.reverse()
        //  console.log(reviews);
        res.send(reviews)
    })



    // create services 
    app.post('/services', async(req, res)=>{
        const addServices = req.body
        // console.log(addServices);
        const result = await serviceCollection.insertOne(addServices)
        res.send(result)
    })


    // create reviews
    app.post('/reviews', async(req, res)=>{
        const addReviews = req.body
        // console.log(addReviews);
        const result = await reviewCollection.insertOne(addReviews)
        res.send(result)
    })




    // update review
    app.put('/myreviews/:id', async (req, res)=>{
        const id = req.params.id
       
        const filter = {_id : ObjectId(id)}
       

        const review= req.body
        const option = {upsert : true}
        
        const updatedReview = {
            $set: {
                review : review.review, 
                rating : review.rating
            }
        }
        
        const result = await reviewCollection.updateOne(filter, updatedReview, option)
        res.send(result)
        // console.log(result);



   
    })


    // delete review

    app.delete('/reviews/:id', async(req, res)=>{
        const id = req.params.id
        const query = { _id : ObjectId(id)}
        const result = await reviewCollection.deleteOne(query)
        res.send(result)
    })


}
run().catch(err => console.log(e))



app.get('/', (req, res)=>{
    res.send('Globe Route Travels API is running')
})

app.listen(port, ()=>{
    console.log('Globe Route Travels server running on port', port);
})