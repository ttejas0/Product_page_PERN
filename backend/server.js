import express from "express"; // Importing Express framework
import helmet from "helmet"; // Importing Helmet for security
import morgan from "morgan"; // Importing Morgan for request logging
import cors from "cors"; // Importing CORS to handle cross-origin requests
import dotenv from "dotenv"; // Importing dotenv to load environment variables

import productRoutes from "./routes/productRoutes.js"; // Importing product-related routes
import { sql } from "./config/db.js";
import { aj } from "./lib/arcjet.js";

dotenv.config(); // Load environment variables from .env file

const app = express(); // Create an instance of an Express application
const PORT = process.env.PORT || 3000; // Set the port from environment or default to 3000

console.log(PORT); // Log the server port to the console

app.use(express.json()); // Middleware to parse incoming JSON requests
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(helmet()); // helmet is a security middleware that helps you protect your app by setting various HTTP headers
app.use(morgan("dev")); // log the requests

// apply arcjet rate-limit to all routes

app.use(async (req, res, next) => {
  try {
    const decision = await aj.protect(req, {
      request: 1, // specifies that each result consumes 1 token
    });

    if (decision.isDenied()) {
      if (decision.reson.isRateLimit()) {
        res.status(429).json({ error: "Too Many Requests" });
      } else if (decision.reson.isBot()) {
        res.status(403).json({ error: "Bot access denied" });
      } else {
        res.status(403).json({ error: "Forbidden" });
      }
      return;
    }

    //check for spoofed bots
    if (
      decision.results.some(
        (results) => results.reason.isBot() && results.reason.isSpoofed()
      )
    ) {
      res.status(403).json({ error: "Spoofed bot detected" });
      return;
    }

    next();
  } catch (error) {
    console.error("Arcject error", error);
    next(error);
  }
});

app.use("/api/products", productRoutes); // Route for product-related API requests

async function initDB() {
  try {
    await sql`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                image VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Error initializing database:", error);
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port " + PORT); // Log server startup message
  });
});
