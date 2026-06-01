require("dotenv").config();
const cors = require("cors");
const express = require("express");

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes =
require("./routes/authRoutes");

const productRoutes =
require("./routes/productRoutes");

const orderRoutes =
require("./routes/orderRoutes");

const warehouseRoutes =
require("./routes/warehouseRoutes");

const deliveryRoutes =
require("./routes/deliveryRoutes");

const dashboardRoutes =
require("./routes/dashboardRoutes");

const reportRoutes =
require("./routes/reportRoutes");

const notificationRoutes =
require("./routes/notificationRoutes");

connectDB();

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/products",
    productRoutes
);

app.use(
    "/api/orders",
    orderRoutes
);

app.use(
    "/api/warehouse",
    warehouseRoutes
);

app.use(
    "/api/delivery",
    deliveryRoutes
);

app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/reports",
    reportRoutes
);

app.use(
    "/api/notifications",
    notificationRoutes
);

app.get("/", (req, res) => {

    res.send(
        "Inventory API Running"
    );
});

const PORT =
process.env.PORT || 8000;

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );
});