const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lhcdr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyjwt(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "Unauthorize Access" });
  }
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const db = client.db("Bikes_Alaeze");
    const product_collection = db.collection("bikes_products");
    const review_collection = db.collection("reviews_products");
    const purchage_product = db.collection("purchage_products");
    const userCollection = db.collection("user");

    app.get("/products", async (req, res) => {
      const query = {};
      const result = await product_collection.find(query).toArray();
      res.send(result);
    });
    app.post("/products", async (req, res) => {
      const addProduct = req.body;
      const result = await product_collection.insertOne(addProduct);
      res.send(result);
    });
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await product_collection.findOne(filter);
      res.send(result);
    });

    app.get("/mypurchage", verifyjwt, async (req, res) => {
      const customerEmail = req.query.Email;
      const decodedEmail = req.decoded.email;
      if (customerEmail === decodedEmail) {
        const query = { Email: customerEmail };
        const result = await purchage_product.find(query).toArray();
        return res.send(result);
      } else {
        return res.status(403).send({ message: "Forbidden Access" });
      }
    });

    app.post("/reviews", async (req, res) => {
      const addReview = req.body;
      const result = await review_collection.insertOne(addReview);
      res.send(result);
    });
    app.get("/reviews", async (req, res) => {
      const query = {};
      const result = await review_collection.find(query).toArray();
      res.send(result);
    });
    app.get("/purchage", async (req, res) => {
      const query = {};
      const result = await purchage_product.find(query).toArray();
      res.send(result);
    });
    app.post("/purchage", async (req, res) => {
      const purchageProduct = req.body;
      const result = await purchage_product.insertOne(purchageProduct);
      res.send(result);
    });
    app.get("/users", verifyjwt, async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });

    app.put("/users/admin/:email", verifyjwt, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const requester = req.decoded.email;
      const recquesterRole = await userCollection.findOne({ email: requester });
      if (recquesterRole.role === "admin") {
        const updatedoc = {
          $set: { role: "admin" },
        };
        const result = await userCollection.updateOne(filter, updatedoc);
        return res.send(result);
      } else {
        return res.status(403).send({ message: "Forbidden Access" });
      }
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updatedoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updatedoc, options);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "24h" }
      );
      res.send({ result, token });
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello there i am from bike alaeze");
});
app.listen(port, () => {
  console.log(`Doctors App listening on port ${port}`);
});
