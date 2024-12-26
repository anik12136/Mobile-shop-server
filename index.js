const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 7000;
require('dotenv').config()
const { text } = require('express');
app.use(cors());
app.use(express.json());

const multer = require('multer');
const router = express.Router();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.00oqpy6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const demoCourses = client.db("gadget-shop").collection("testData");
    const usersCollection = client.db("gadget-shop").collection("registerUsers");
    const allProductsCollection = client.db("gadget-shop").collection("allProducts");
    const bookmarks = client.db("gadget-shop").collection("bookmarks");
    const cartCollection = client.db("gadget-shop").collection("carts");

    // test data
    app.get('/demoCourses', async (req, res) => {
      const result = await demoCourses.find().toArray();
      res.send(result);
    })

    // insert user collections into database
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists' })
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //get users from database
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    //user email query
    app.get('/users/check/:email', async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email: email });
      res.send(result);
    });

    //make admin 
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);

    })

    //   make seller
    app.patch('/users/seller/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'seller'
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);

    })

    // Add product
    app.post('/addProduct', async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await allProductsCollection.insertOne(body);
      res.send(result);
    });


    // email filtering my products
    app.get("/myProducts/:email", async (req, res) => {
      console.log(req.params.email);
      const allToy = allProductsCollection.find({ seller_email: req.params.email });
      const result = await allToy.toArray();
      res.send(result);
    })

    // delete
    app.delete('/delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await allProductsCollection.deleteOne(query);
      res.send(result);
    })

    // update

    app.put("/updateProduct/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateProduct = {
        $set: {
          price: body.price,
          quantity: body.quantity,
          description: body.description,
        },
      };
      const result = await allProductsCollection.updateOne(filter, updateProduct);
      res.send(result);
    });

    // insert bookmarks to database from instructor
    app.post('/bookmarks', async (req, res) => {
      const newBookmark = req.body;
      console.log(newBookmark);
      const query = { idEmail: newBookmark.idEmail }
      const existingBookmark = await bookmarks.findOne(query);

      if (existingBookmark) {
        return res.send({ message: 'Wishlist already exists' })
      }
      // console.log(newFormCourses);
      else {
        const result = await bookmarks.insertOne(newBookmark);
        res.send(result);
      }
    })

    // get bookmarks using useEffect
    app.get('/bookmarks/:email', async (req, res) => {
      const email = req.params.email;
      const result = await bookmarks.find({ email: email }).toArray();
      res.send(result);
    });

    // one bookmark carts api using tanstack query
    app.get('/bookmarks', async (req, res) => {
      const email = req.query.email;
      const query = { email: email }
      const result = await bookmarks.find(query).toArray();
      res.send(result);
    });

    // delete bookmark
    app.delete('/bookmarks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookmarks.deleteOne(query);
      res.send(result);
    })

    //get Product from database
    app.get('/allProducts', async (req, res) => {
      const result = await allProductsCollection.find().toArray();
      res.send(result);
    });

    // carts
    app.post('/carts', async (req, res) => {
      const newCart = req.body;
      // console.log(newCart);
      const query = { idEmail: newCart.idEmail }
      const existingCart = await cartCollection.findOne(query);

      if (existingCart) {
        return res.send({ message: 'Cart already exists' })
      }
      // console.log(newFormCourses);
      else {
        const result = await cartCollection.insertOne(newCart);
        res.send(result);
      }
    })

    // One User Cart using use effect
    app.get('/carts/:email', async (req, res) => {
      const email = req.params.email;
      const result = await cartCollection.find({ email: email }).toArray();
      res.send(result);
    });

    // one user carts api using tanstack query
    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      const query = { email: email }
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    // cart delete
    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('gadget shop is Running')
})

app.listen(port, () => {
  console.log(`gadget shop API is running on port: ${port}`)
})