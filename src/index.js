const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const { MongoClient } = require("mongodb");
const session = require("express-session");
const collection = require("./mongodb");
// const { MongoClient } = require("mongodb");
const { GridFsStorage } = require("multer-gridfs-storage");
const Book = require("../models/Books");
const fs = require("fs");
const { Readable } = require("stream");

app.use(express.json());
// const PDFModel = require('./models/PDFModel');
const mongoose = require("mongoose");
app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use("/json", express.static(path.join(__dirname, "json")));
app.use("/json", express.static(path.join(__dirname, "views")));

const uri = "mongodb://localhost:27017";
let client = new MongoClient(uri);
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// Set up Express middleware
app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
  res.render("login");
});

app.listen(3001, () => {
  console.log("port connected");
});

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

// app.get("/category", (req, res) => {
//   res.render("category");
// });

app.get("/admin", (req, res) => {
  res.render("admin");
});

app.get("/books", (req, res) => {
  res.render("books");
 // console.log("from books");
});

app.get("/addbooks", (req, res) => {
  res.render("addbooks");
  //console.log("from books");
});

app.post("/login", async (req, res) => {
  try {
    const username = req.body.name;
    const password = req.body.password;

    // Check if the username is "admin" and the password is "ADMIN"
    if (username === "admin" && password === "ADMIN") {
      // Set session flag to indicate the user is an admin
      req.session.isAdmin = true;
      // Redirect to admin dashboard
      res.redirect("/admin");
    } else {
      // Check regular user credentials
      const user = await collect.findOne({
        name: username,
        password: password,
      });
      if (user) {
        // Set session data for regular user
        req.session.username = user.name;
        req.session.libraryId = user.libraryId; // Add library ID to session
        // Render home page for regular user and pass library ID and name
        res.render("home", { username: user.name, libraryId: user.libraryId });
      } else {
        // If credentials don't match, render login page with error message
        res.render("login", { error: "Wrong username or password" });
      }
      
    }
  } catch (error) {
    console.error(error);
    res.send("Error occurred");
  }
});

// Route to render message submission form
app.get("/message", (req, res) => {
  res.render("message");
});

// Handle message submission
app.post("/message", async (req, res) => {
  try {
    const db = client.db("LoginSignupTutorial");
    const messagesCollection = db.collection("message");

    // Extract data from request
    const data = {
      name: req.body.names,
      message: req.body.messages,
    };

    // Store the data in the database
    await messagesCollection.insertOne(data);

    res.redirect("/message"); // Redirect after submission
  } catch (error) {
    console.error("Error submitting message:", error);
    res.send("Error occurred while submitting message");
  }
});

// Render message submission form
app.get("/message", (req, res) => {
  res.render("message");
});

// render recommedation page
app.get("/recommend", (req, res) => {
  res.render("recommend");
});

// Fetch messages for admin view
app.get("/admin_msg", async (req, res) => {
  try {
    // Check if the user is an admin
    if (!req.session.isAdmin) {
      return res.status(403).send("Access Forbidden");
    }

    // Connect to MongoDB
    await client.connect();

    const db = client.db("LoginSignupTutorial");
    const messagesCollection = db.collection("message");

    // Fetch all messages
    const messages = await messagesCollection.find({}).toArray();

    // Render the admin_msg view and pass the messages data to the view
    res.render("admin_msg", { messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.send("Error occurred while fetching messages");
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
});

//store recommendation from user into database
const db = client.db("LoginSignupTutorial");
const collect = db.collection("collection1");
app.post("/recommend", async (req, res) => {
  try {
    const data = req.body.title;
    const desc = req.body.description;

    const recommend = db.collection("recommends");
    await recommend.insertOne({ title: data, description: desc });
    res.redirect("/recommend");
  } catch (error) {
    console.error(error);
    res.send("Error occurred");
  }
});

//Display the recommendations in admin page

// Assuming client is already initialized and available in this scope

app.get("/admin_recom", async (req, res) => {
  try {
    // Connect to MongoDB
    await client.connect();

    const db = client.db("LoginSignupTutorial");
    const RecommendCollection = db.collection("recommends");
    console.log("admin_recommend");

    // Fetch all recommends
    const recommendations = await RecommendCollection.find({}).toArray();
    console.log(recommendations); // Use 'recommendations' directly, not 'this.recommendations'

    // Render the admin_msg view and pass the messages data to the view
    res.render("admin_recom", { recommendations });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.send("Error occurred while fetching recommendations");
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
});

app.post("/signup", async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      password: req.body.password,
      cpassword: req.body.cpassword,
      libraryId: generateFourDigitRandomNumber(),
    };

    // Store the user's name, password, and library ID in the database
    await collect.insertOne(data);

    // Store the user's name and library ID in the session
    req.session.username = data.name;
    req.session.libraryId = data.libraryId;

    res.render("home", { username: data.name, libraryId: data.libraryId });
  } catch (error) {
    console.error(error);
    res.send("Error occurred");
  }
});

function generateFourDigitRandomNumber() {
  return Math.floor(1000 + Math.random() * 9000);
}

app.get("/managestudents", async (req, res) => {
  try {
    // Check if the user is an admin
    if (!req.session.isAdmin) {
      return res.status(403).send("Access Forbidden");
    }

    // Fetch all students from the collection
    const students = await collect.find({ name: { $ne: "admin" } }).toArray();
    // Render the manage students page and pass the students data
    res.render("managestudents", { students });
  } catch (error) {
    console.error(error);
    res.send("Error occurred");
  }
});

// Route to handle removing a student
app.post("/removestudent", async (req, res) => {
  try {
    // Check if the user is an admin
    if (!req.session.isAdmin) {
      return res.status(403).send("Access Forbidden");
    }

    const studentId = req.body.studentId;
    // Remove the student from the collection based on the provided studentId
    await collection.deleteOne({ _id: studentId });
    res.redirect("/managestudents"); // Redirect back to the manage students page
  } catch (error) {
    console.error(error);
    res.send("Error occurred");
  }
});

// //Route to remove message
app.post("/removeMessage", async (req, res) => {
  try {
    // Check if the user is an admin
    // if (!req.session.isAdmin) {
    //   return res.status(403).send("Access Forbidden");
    // }

    const studentName = req.body.studentName; // Assuming studentName is the name of the student associated with the message
    // Remove the message from the collection based on the provided studentName
    console.log(studentName);
    const messagesCollection = db.collection("message");
    await messagesCollection.deleteOne({ name: studentName });
    res.redirect("/admin_msg"); // Redirect back to the manage students page
  } catch (error) {
    console.error(error);
    res.send("Error occurred");
  }
});
app.get("/category", async (req, res) => {
  try {
    const category = req.query.category; // Extract the category from the query string
    //console.log("Category:", category); // Log the category parameter to check if it's received correctly

    // Choose the appropriate collection based on the category
    let collectionName = "";
    switch (category) {
      case "novel":
        collectionName = "novels";
        break;
      case "history":
        collectionName = "history";
        break;
      case "sci":
        collectionName = "sci";
        break;
      case "course":
        collectionName = "course";
        break;
      default:
        return res.status(404).json({ message: "Category not found" });
    }

    // Fetch data from the specified collection
    const db = client.db("LoginSignupTutorial"); // Change to your database name
    const collection = db.collection(collectionName);
    const books = await collection.find({}).toArray();
    //console.log(collection);
    //console.log('Fetched books:', books); // Log the fetched books to check if data is retrieved

    // Render the category page and pass the books data
    res.render("category", { category, books });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//book adding

const port = 3000;

// Multer setup for file uploads
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/json/books/");
  },
  filename: function (req, file, cb) {
    // cb(
    //   null,
    //   file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    // );
    cb(null, file.originalname);
  },
});

let upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

// Express middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "hbs");
app.use(express.static("public"));

// Session middleware setup
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// MongoDB connection setup
// const uri = 'mongodb://localhost:27017';
client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// let db; // Database reference

// Connect to MongoDB
client.connect((err) => {
  if (err) {
    console.error("Error connecting to MongoDB:", err);
    return;
  }
  console.log("Connected to MongoDB");
  db = client.db("LoginSignupTutorial"); // Set the database reference
});

// Routes

const conn = mongoose.connection;

// Initialize GridFS
let gfs;
conn.once("open", () => {
  gfs = new GridFsStorage({
    url: uri,
    file: (req, file) => {
      return {
        filename: file.originalname,
        bucketName: "pdfFiles",
      };
    },
  });
});

// Initialize Multer for file upload
// const upload = multer({ storage: gfs });

// Middleware and routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "hbs");

app.get("/addbooks", (req, res) => {
  res.sendFile(path.join(__dirname, "addbooks.html"));
});
// Handle file upload and form submission
app.post("/upload", upload.single("pdfFile"), async (req, res) => {
  try {
    const db = client.db("LoginSignupTutorial"); // Change to your database name

    // Extract data from the request
    const { title, category, description, author } = req.body;
    const filename = req.file.filename;
    const filePath = req.file.path; // Get the file path

    console.log(filePath);

    // Manipulate filePath to remove "public" from the URL
    const publicIndex = filePath.indexOf("public");
    const newPath = filePath.substring(publicIndex + "public".length + 1); // +1 to remove the following slash
    console.log(newPath);

    // Check the category and select the appropriate collection
    let collectionName;
    switch (category) {
      case "History":
        collectionName = "history";
        break;
      case "novel":
        collectionName = "novels";
        break;
      case "science_fiction":
        collectionName = "sci";
        break;
      case "course":
          collectionName = "course";
          break;
      default:
        collectionName = "defaultCollection"; // Define a default collection name
        break;
    }

    const view = filePath;

    // Insert data into MongoDB
    const collection = db.collection(collectionName);
    await collection.insertOne({
      title,
      author,
      description,
      // Store the file path in MongoDB
      view: newPath, // Store the modified file path in MongoDB
    });
    res.send(`
        <script>
            alert("Book added successfully");
            window.location.href = "/admin"; // Redirect to home page after displaying the alert
        </script>
    `);
    //res.send("Book added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred while adding the book");
  }
});

// Start the server
// port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
