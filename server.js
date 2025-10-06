require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const { connectDB, sequelize } = require("./config/db");

const adminRoutes = require("./routes/adminRoute");
const candidateRoute = require("./routes/candidateRoute");
const classifiedRoutes = require("./routes/classifiedRoute");
const homePageSliderRoutes = require("./routes/homePageSliderRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const blogRoutes = require("./routes/blogRoutes");
const membershipRoutes = require("./routes/membershipRoute");
const communityServiceRoutes = require("./routes/communityServiceRoutes");
const attributeValueRoutes = require("./routes/attributeValueRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static("uploads"));

const baseUrl = "api";

app.use(`/${baseUrl}/auth`, adminRoutes);
app.use(`/${baseUrl}/candidates`, candidateRoute);
app.use(`/${baseUrl}/classifieds`, classifiedRoutes);
app.use(`/${baseUrl}/sliders`, homePageSliderRoutes);
app.use(`/${baseUrl}/blogs`, blogRoutes);
app.use(`/${baseUrl}/membership`, membershipRoutes);
app.use(`/${baseUrl}/community-services`, communityServiceRoutes);
app.use(`/${baseUrl}/attributes`, attributeValueRoutes);
app.use(`/${baseUrl}`, galleryRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Server is running!",
    timestamp: new Date().toISOString(),
    database: "Connected",
  });
});

const PORT = process.env.PORT || 4005;

async function init() {
  try {
    await connectDB();

    // Sync database with force: false to preserve existing data
    await sequelize.sync({ force: false });
    console.log("Database synced successfully");

    app.listen(PORT, () => {
      console.log(`Express server started on http://localhost:${PORT}`);
      console.log(`Uploads directory: ${uploadsDir}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

init();
