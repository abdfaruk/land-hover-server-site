const express = require('express')
const app = express()
const ObjectId = require('mongodb').ObjectId
const cors = require('cors');
require('dotenv').config()
const { MongoClient } = require('mongodb');
const port =process.env.PORT || 5000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.la7pp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db('find_your_home');
        const productsCollection = database.collection('products');
        const homeCollection = database.collection('bookingInfo');
        const usersCollection = database.collection('users');
        const reviewCollection = database.collection('review');

        app.get('/products', async(req, res)=>{
          const cursor = productsCollection.find({});
          const products = await cursor.toArray();
          res.send(products);
      });

        app.delete('/deleteProducts/:id', async(req, res)=>{
          const result = await productsCollection.deleteOne({_id:ObjectId(req.params.id)});
          res.send(result);
        })

        app.get('/bookingInfo', async(req, res)=>{
          const email = req.query.email;
          const query = {email: email}
          const cursor = homeCollection.find(query);
          const bookingInfo = await cursor.toArray();
          res.json(bookingInfo);
        })

        app.get('/orders', async(req, res)=>{
          const cursor = homeCollection.find({});
          const orders = await cursor.toArray();
          res.json(orders);
        })

        app.post('/bookingInfo', async(req, res)=>{
            const bookInfo = req.body;
            const result = await homeCollection.insertOne(bookInfo);
            res.json(result)
        })

        app.post('/addProduct', async(req, res) =>{
          const result= await productsCollection.insertOne(req.body);
          res.send(result);
        })

        app.post('/review', async(req, res) =>{
          const review = req.body;
          const result = await reviewCollection.insertOne(review);
          res.json(result)
        })


        app.get('/review', async(req, res)=>{
          const cursor = reviewCollection.find({});
          const review = await cursor.toArray();
          res.json(review);
        })

        app.get('/users/:email', async(req, res) =>{
          const email = req.params.email;
          const query= {email: email};
          const user = await usersCollection.findOne(query);
          let isAdmin = false;
          if(user?.role === 'admin'){
            isAdmin = true;
          }
          res.json({admin: isAdmin});
        })

        app.post('/users', async(req, res)=>{
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          res.json(result);
        })

        app.put('/users', async(req, res)=>{
          const user = req.body;
          const filter = {email: user.email};
          const options = {upsert: true};
          const updateDoc = {$set: user};
          const result = await usersCollection.updateOne(filter, updateDoc, options);
          res.json(result);
        })

        app.put('/users/admin', async(req, res) =>{
          const user = req.body;
          const filter = {email: user.email};
          const updateDoc = {$set: {role: 'admin'}};
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.json(result);
        })


        
    }
    finally{

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`listening at :${port}`)
})