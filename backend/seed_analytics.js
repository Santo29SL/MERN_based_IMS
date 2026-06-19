require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Product = require("./models/Product");
const Order = require("./models/Order");
const Notification = require("./models/Notification");
const StockLog = require("./models/StockLog");
const Restock = require("./models/Restock");

async function seed() {
    console.log("Connecting to database...");
    await connectDB();

    console.log("Checking for existing users...");
    let existingUsers = await User.find({});
    console.log(`Found ${existingUsers.length} existing users.`);

    const TARGET_USERS_COUNT = 50;
    const hashedPassword = await bcrypt.hash("password123", 10);

    if (existingUsers.length < TARGET_USERS_COUNT) {
        const usersNeeded = TARGET_USERS_COUNT - existingUsers.length;
        console.log(`Creating ${usersNeeded} new customer users to reach a total of 50 users...`);
        
        const newUsersToInsert = [];
        for (let i = 1; i <= usersNeeded; i++) {
            newUsersToInsert.push({
                name: `Seeded Customer ${i}`,
                email: `seeded_customer_${i}_${Date.now()}@test.com`,
                password: hashedPassword,
                role: "customer"
            });
        }
        await User.insertMany(newUsersToInsert);
        console.log(`Successfully added ${usersNeeded} users.`);
    } else {
        console.log(`Already have ${existingUsers.length} users, which satisfies the target of 50.`);
    }

    // Retrieve the final list of 50 users
    const allUsers = await User.find({});
    console.log(`Final Users Count in Database: ${allUsers.length}`);

    const customers = allUsers.filter(u => u.role === "customer");
    const deliveryPartners = allUsers.filter(u => u.role === "delivery");
    const warehouseWorkers = allUsers.filter(u => u.role === "warehouse");
    const admins = allUsers.filter(u => u.role === "admin");

    // Clear transactional tables
    console.log("Clearing old orders, restocks, notifications, and logs to seed a fresh 100-order simulation...");
    await Order.deleteMany({});
    await Restock.deleteMany({});
    await Notification.deleteMany({});
    await StockLog.deleteMany({});

    // Fetch existing products
    let products = await Product.find({});
    console.log(`Found ${products.length} existing products in database.`);

    if (products.length === 0) {
        console.log("No products found! Seeding some default products to restore catalog...");
        const defaultProductData = [
            { productName: "iPhone 15 Pro", category: "Mobile", price: 999.99, quantity: 120, reorderLevel: 10, warehouseLocation: "A-1" },
            { productName: "Samsung Galaxy S24", category: "Mobile", price: 899.99, quantity: 100, reorderLevel: 8, warehouseLocation: "A-2" },
            { productName: "MacBook Pro M3", category: "Laptops", price: 1999.99, quantity: 45, reorderLevel: 5, warehouseLocation: "B-1" },
            { productName: "Dell XPS 15", category: "Laptops", price: 1499.99, quantity: 40, reorderLevel: 5, warehouseLocation: "B-2" },
            { productName: "AirPods Pro 2", category: "Accessories", price: 249.99, quantity: 250, reorderLevel: 15, warehouseLocation: "C-1" },
            { productName: "Anker USB-C Hub", category: "Accessories", price: 49.99, quantity: 300, reorderLevel: 20, warehouseLocation: "C-2" },
            { productName: "Philips Hue Smart Bulb", category: "Home", price: 39.99, quantity: 180, reorderLevel: 12, warehouseLocation: "D-1" },
            { productName: "Roborock Q7 Max", category: "Home", price: 599.99, quantity: 35, reorderLevel: 4, warehouseLocation: "D-2" }
        ];
        for (let p of defaultProductData) {
            const prod = await Product.create(p);
            products.push(prod);
        }
        products = await Product.find({});
        console.log(`Seeded ${products.length} catalog products.`);
    }

    // Set stock levels to reflect Out-of-Stock and Low-Stock
    console.log("Updating stock levels to guarantee low-stock and out-of-stock items...");
    // Let's make Product 0 and 1 low stock
    if (products[0]) {
        products[0].quantity = 3;
        products[0].reorderLevel = 10;
        await products[0].save();
    }
    if (products[1]) {
        products[1].quantity = 2;
        products[1].reorderLevel = 8;
        await products[1].save();
    }
    // Let's make Product 2 and 3 out of stock
    if (products[2]) {
        products[2].quantity = 0;
        products[2].reorderLevel = 5;
        await products[2].save();
    }
    if (products[3]) {
        products[3].quantity = 0;
        products[3].reorderLevel = 5;
        await products[3].save();
    }

    console.log("Seeding Restock Requests & Restock logs...");
    // Pending restock requests for low/out-of-stock items
    await Restock.create({ productId: products[0]._id, currentStock: products[0].quantity, requestedQuantity: 100, status: "pending" });
    await Restock.create({ productId: products[1]._id, currentStock: products[1].quantity, requestedQuantity: 100, status: "pending" });
    await Restock.create({ productId: products[2]._id, currentStock: products[2].quantity, requestedQuantity: 100, status: "pending" });
    await Restock.create({ productId: products[3]._id, currentStock: products[3].quantity, requestedQuantity: 100, status: "pending" });

    // Completed restock requests
    await Restock.create({ productId: products[4]._id, currentStock: 15, requestedQuantity: 100, status: "completed" });
    await Restock.create({ productId: products[5]._id, currentStock: 20, requestedQuantity: 100, status: "completed" });
    await Restock.create({ productId: products[6]._id, currentStock: 10, requestedQuantity: 100, status: "completed" });

    // Seed stock logs
    const whUser = warehouseWorkers[0] || allUsers[0];
    const admUser = admins[0] || allUsers[0];
    await StockLog.create({ productId: products[4]._id, userId: whUser._id, action: "RESTOCK", quantity: 100, reason: "Warehouse Restock completed" });
    await StockLog.create({ productId: products[5]._id, userId: whUser._id, action: "RESTOCK", quantity: 100, reason: "Warehouse Restock completed" });
    await StockLog.create({ productId: products[6]._id, userId: admUser._id, action: "ADD", quantity: 50, reason: "Initial setup" });

    console.log("Creating 100 customized Orders...");
    const ordersToInsert = [];
    const notificationsToInsert = [];

    // Helper to generate a date in 2026
    const makeDate = (monthIndex, day, hour, minute) => {
        return new Date(2026, monthIndex, day, hour, minute, 0);
    };

    for (let i = 1; i <= 100; i++) {
        const customer = customers[i % customers.length];
        const product = products[i % products.length];
        const quantity = (i % 3) + 1; // 1 to 3 units
        const totalPrice = Number((product.price * quantity).toFixed(2));
        
        const month = i % 6; 
        const day = (i * 7) % 28 + 1;
        const hour = (i * 5) % 24; 
        const minute = (i * 12) % 60;
        const date = makeDate(month, day, hour, minute);

        // Distribute statuses:
        // i <= 15 => pending
        // 15 < i <= 30 => packed
        // 30 < i <= 45 => shipped
        // 45 < i <= 90 => delivered
        // 90 < i <= 100 => cancelled
        let status = "delivered";
        let deliveryPartner = undefined;

        if (i <= 15) {
            status = "pending";
        } else if (i <= 30) {
            status = "packed";
        } else if (i <= 45) {
            status = "shipped";
            if (deliveryPartners.length > 0) {
                deliveryPartner = deliveryPartners[i % deliveryPartners.length]._id;
            }
        } else if (i <= 90) {
            status = "delivered";
            if (deliveryPartners.length > 0) {
                deliveryPartner = deliveryPartners[i % deliveryPartners.length]._id;
            }
        } else {
            status = "cancelled";
        }

        ordersToInsert.push({
            customer: customer._id,
            product: product._id,
            quantity,
            totalPrice,
            status,
            deliveryPartner,
            createdAt: date,
            updatedAt: date
        });
    }

    await Order.collection.insertMany(ordersToInsert);
    console.log(`Inserted ${ordersToInsert.length} orders into the database.`);

    const allInsertedOrders = await Order.find({});

    console.log("Adding operational notifications...");
    // 1. Low stock alerts
    notificationsToInsert.push({ title: "Low Stock Alert", message: `${products[0].productName} stock below reorder level`, type: "LOW_STOCK", isRead: false });
    notificationsToInsert.push({ title: "Low Stock Alert", message: `${products[1].productName} stock below reorder level`, type: "LOW_STOCK", isRead: false });
    notificationsToInsert.push({ title: "Restock Completed", message: `${products[4].productName} restocked successfully`, type: "RESTOCK", isRead: true });

    // 2. Priority alerts (nudges)
    for (let idx = 0; idx < allInsertedOrders.length; idx++) {
        const order = allInsertedOrders[idx];
        const product = products.find(p => p._id.toString() === order.product.toString());
        
        const isMobile = product.category === "Mobile";
        const isPendingOrPacked = order.status === "pending" || order.status === "packed";
        if (isPendingOrPacked && ((isMobile && idx % 2 === 0) || idx % 5 === 0)) {
            const date = order.createdAt;
            notificationsToInsert.push({
                title: `Priority: ${order.status === "pending" ? "Pack" : "Dispatch"} Order #${order._id.toString().substring(18)}`,
                message: `Admin has prioritized the delivery of ${product.productName} (${order.quantity} Units).`,
                type: "PRIORITY",
                isRead: idx % 2 === 0,
                createdAt: date,
                updatedAt: date
            });
        }
    }

    if (notificationsToInsert.length > 0) {
        await Notification.collection.insertMany(notificationsToInsert);
    }
    console.log(`Inserted ${notificationsToInsert.length} operational notifications.`);

    console.log("--- SEEDING 50 USERS / 100 ORDERS COMPLETED SUCCESSFULLY ---");
    process.exit(0);
}

seed().catch(err => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
