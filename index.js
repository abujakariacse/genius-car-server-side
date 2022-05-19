const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// middleware 
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zw8v2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {

    try {
        await client.connect()
        const serviceCollection = client.db("geniusCar").collection("services");

        // Load All Data from DB
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // Load a spicific data form DB
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: ObjectId(id)
            };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        // Post a data to DB
        app.post('/service', async (req, res) => {
            const data = req.body;
            const result = await serviceCollection.insertOne(data);
            res.send(result);
        });

        // Delete a data form db
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result)
        });

        // Update a data 
        app.put('/service/:id', async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            const query = { _id: ObjectId(id) };
            const doc = {
                $set: {
                    name: body.name,
                    price: body.price
                }
            };
            const options = { upsert: true };
            const result = await serviceCollection.updateOne(query, doc, options);
            res.send(result)

        })

    }
    finally {
        // await client.close();

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Genius Car is Running')
});

app.listen(port, () => {
    console.log('Server is running on port', port)
})