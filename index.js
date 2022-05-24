const express = require("express");
const cors= require("cors");
const req = require("express/lib/request");
var ObjectId = require('mongodb').ObjectId; 
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lhcdr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        await client.connect();
        const db = client.db("Bikes_Alaeze");
        const product_collection = db.collection('bikes_products');
        const review_collection = db.collection('reviews_products');

        app.get('/products',async(req,res)=>{
        const query = {}
        const result = await product_collection.find(query).toArray();
        res.send(result);
        })
        app.get('/products/:id',async(req,res)=>{
            const id=req.params.id;
        const filter={ _id: ObjectId(id) }

        const result = await product_collection.findOne(filter);
        res.send(result);
        })

        app.get('/reviews',async(req,res)=>{
            const query = {}
            const result = await review_collection.find(query).toArray();
        res.send(result);
        })
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('hello there i am from bike alaeze');
})
app.listen(port, () => {
    console.log(`Doctors App listening on port ${port}`)
  })