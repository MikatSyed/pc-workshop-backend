require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
const port = 4000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://pc-workshop:YPJMghHoLqeATUNB@cluster0.du7xt.mongodb.net/PcWorkshopDB?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const run = async () => {
  try {
    const db = client.db("PcWorkshopDB");
    const productCollection = db.collection("products");


    app.get("/products", async (req, res) => {
      const category = req.query.category;
      let products;
      if (category) {
        products = await productCollection.find({ category }).toArray();
      } else {
        products = await productCollection.find({}).toArray();
      }
      res.send({ status: true, Total: products.length,  data:products });
    });
    app.get("/product/details/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = productCollection.find({ _id: ObjectId(id) });
      const product = await cursor.toArray();

      res.send({ status: true, Total: product.length, data: product });
    });

    app.get("/category", async (req, res) => {
      try {
        // Get all unique categories from the database
        const categories = await productCollection.distinct("category");
    
        // Calculate the count of products for each category and construct an array of objects
        const categoryProductCount = await Promise.all(
          categories.map(async (category) => {
            const count = await productCollection.countDocuments({ category });
            return { category, count };
          })
        );
    
        res.json({
          status: true,
          categoryProductCount,
        });
      } catch (error) {
        res.status(500).json({ status: false, message: "Something went wrong" });
      }
    });
    
    

  app.get("/products/random", async (req, res) => {
      const categories = await productCollection.distinct('category');
     const oneProductPerCategory = [];

  for (const category of categories) {
    const product = await productCollection.findOne({ category });
    if (product) {
      oneProductPerCategory.push(product);
    }
  }
  const data = oneProductPerCategory.slice(0,6)
      res.send({ status: true,  Total:data.length, data });
    });

  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
