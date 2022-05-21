const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// middleware 
app.use(cors());
app.use(express.json());


// To verify JWT
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden' })
        }
        req.decoded = decoded;
        next();
    })

}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zw8v2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {

    try {
        await client.connect()
        const serviceCollection = client.db("geniusCar").collection("services");
        const orderCollection = client.db("geniusCar").collection("order");

        app.post('/login', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '30d'
            });
            res.send({ token });
        });




        /*===================================================================================
                                            SERVICES:-
        ===================================================================================*/

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
        // insert an order to db
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        });

        // get all Orders from db
        app.get('/order', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (decodedEmail === email) {
                const query = { email };
                const cursor = orderCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            }
            else {
                return res.status(403).send({ message: 'unauthorized login try' })
            }


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