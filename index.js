const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


// middleware
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3i8mx1l.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run(){

    const serviceCollection = client.db('globeRouteTravels').collection('services')



    // create services 
    app.post('/services', async(req, res)=>{
        const addServices = req.body
        // console.log(addServices);
        const result = await serviceCollection.insertOne(addServices)
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