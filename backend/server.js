const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';

// --- 1. Middleware ---
app.use(helmet({
    crossOriginResourcePolicy: false, 
}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// --- 2. Database Connection ---
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fashionStoreDB';
        await mongoose.connect(mongoURI);
        console.log("✅ MongoDB Connected Successfully");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1);
    }
};
connectDB();

// --- 3. Schemas & Models ---

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    addresses: [{
        name: String, street: String, city: String, state: String, zip: String
    }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, enum: ['Men', 'Women', 'Kids'], index: true },
    
    // --- INTEGRATED: SubCategory for Kids (Boys/Girls) ---
    subCategory: { type: String, enum: ['Boys', 'Girls', 'Unisex', 'None'], default: 'None' },
    
    stock: { type: Number, required: true, min: 0 },
    image: { type: String }, 
    images: [String],          
    description: { type: String },
    sizes: [String],
    
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },

    reviews: [{ 
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        userName: { type: String, required: true }, 
        rating: { type: Number, required: true }, 
        comment: { type: String, required: true }, 
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    userEmail: { type: String, required: true },
    userName: { type: String },
    amount: { type: Number, required: true },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Packed', 'Shipped', 'Delivered', 'Return Requested', 'Refunded', 'Cancelled'] },
    returnReason: { type: String },
    deliveredAt: { type: Date }, 
    
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        image: { type: String, required: true }, 
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        size: { type: String, required: true }
    }],
    orderDate: { type: Date, default: Date.now }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        price: Number,
        image: String,
        size: String,
        quantity: { type: Number, required: true, min: 1, default: 1 }
    }],
    totalPrice: { type: Number, required: true, default: 0 }
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

const newsletterSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true }
}, { timestamps: true });

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

// --- 4. Middlewares ---

const protect = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            
            if (decoded.id === '650000000000000000000000') {
                req.user = { _id: '650000000000000000000000', isAdmin: true, email: 'admin@gmail.com', name: 'System Admin' };
                return next();
            }

            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) return res.status(401).json({ message: "User no longer exists" });
            next();
        } catch (error) {
            return res.status(401).json({ message: "Not authorized" });
        }
    } else {
        return res.status(401).json({ message: "No token provided" });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.isAdmin) next();
    else res.status(403).json({ message: "Access denied: Admins only" });
};

const generateToken = (id, isAdmin) => jwt.sign({ id, isAdmin }, JWT_SECRET, { expiresIn: '24h' });

// --- 5. Routes ---

// AUTH
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({ name, email, password: hashedPassword });
        
        await Cart.create({ user: newUser._id, items: [], totalPrice: 0 });

        res.status(201).json({ 
            token: generateToken(newUser._id, newUser.isAdmin), 
            user: { id: newUser._id, name: newUser.name, email: newUser.email, isAdmin: newUser.isAdmin } 
        });
    } catch (err) { res.status(500).json({ message: "Registration failed" }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === "admin@gmail.com" && password === "admin123") {
            const adminId = '650000000000000000000000';
            return res.json({ 
                token: generateToken(adminId, true), 
                user: { id: adminId, name: "System Admin", email: "admin@gmail.com", isAdmin: true } 
            });
        }

        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ 
                token: generateToken(user._id, user.isAdmin), 
                user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } 
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (err) { res.status(500).json({ message: "Login failed" }); }
});

// PROFILE
app.put('/api/users/profile', protect, async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).select('-password');
        res.json(updatedUser);
    } catch (err) { res.status(400).json({ message: "Update failed" }); }
});

// WISHLIST
app.get('/api/wishlist', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        res.json(user.wishlist);
    } catch (err) { res.status(500).json({ message: "Fetch wishlist failed" }); }
});

app.post('/api/wishlist', protect, async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);
        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }
        res.status(201).json({ message: "Added to wishlist" });
    } catch (err) { res.status(400).json({ message: "Wishlist update failed" }); }
});

app.delete('/api/wishlist/:productId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
        await user.save();
        res.json({ message: "Item removed from wishlist" });
    } catch (err) { 
        res.status(500).json({ message: "Failed to remove item" }); 
    }
});

// PRODUCTS
app.get('/api/products', async (req, res) => {
    try {
        // --- INTEGRATED: Added subCategory to the query extraction ---
        const { category, subCategory, search } = req.query; 
        
        let query = {};
        if (category && category !== 'All') query.category = category;
        
        // --- INTEGRATED: Apply the Boys/Girls filter if requested by the frontend ---
        if (subCategory && subCategory !== 'All') query.subCategory = subCategory; 
        
        if (search) query.name = { $regex: search, $options: 'i' };
        
        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) { res.status(500).json({ message: "Fetch products failed" }); }
});

app.post('/api/products/:id/reviews', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: "You have already reviewed this product." });
            }

            const review = {
                user: req.user._id,
                userName: req.user.name,
                rating: Number(rating),
                comment,
            };

            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

            await product.save();
            res.status(201).json({ message: "Review added successfully!" });
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (err) { 
        res.status(500).json({ message: "Failed to submit review" }); 
    }
});

// ADMIN PRODUCT CRUD
app.post('/api/products', protect, adminOnly, async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (err) { res.status(400).json({ message: "Creation failed" }); }
});

app.put('/api/products/:id', protect, adminOnly, async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(400).json({ message: "Update failed" }); }
});

app.delete('/api/products/:id', protect, adminOnly, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted" });
    } catch (err) { res.status(500).json({ message: "Delete failed" }); }
});

// PERSISTENT CART ROUTES
app.get('/api/cart', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
        res.json(cart);
    } catch (err) { res.status(500).json({ message: "Fetch cart failed" }); }
});

app.post('/api/cart', protect, async (req, res) => {
    try {
        const { productId, name, price, image, size, quantity } = req.body;
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) cart = new Cart({ user: req.user._id, items: [], totalPrice: 0 });

        const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId && p.size === size);
        if (itemIndex > -1) cart.items[itemIndex].quantity += quantity;
        else cart.items.push({ productId, name, price, image, size, quantity });

        cart.totalPrice = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        await cart.save();
        res.status(200).json(cart);
    } catch (err) { res.status(400).json({ message: "Add to cart failed" }); }
});

app.put('/api/cart/update', protect, async (req, res) => {
    try {
        const { productId, size, quantity } = req.body;
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId && p.size === size);
        
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity; 
            cart.totalPrice = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            await cart.save();
            return res.status(200).json(cart);
        }
        res.status(404).json({ message: "Item not found in cart" });
    } catch (err) { 
        res.status(500).json({ message: "Update cart failed" }); 
    }
});

app.delete('/api/cart/item/:productId/:size', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });
        
        cart.items = cart.items.filter(item => 
            !(item.productId.toString() === req.params.productId && item.size === req.params.size)
        );
        
        cart.totalPrice = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        await cart.save();
        res.json(cart);
    } catch (err) { 
        res.status(500).json({ message: "Remove from cart failed" }); 
    }
});

app.delete('/api/cart', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = [];
        cart.totalPrice = 0;
        
        await cart.save();
        res.json({ message: "Cart cleared successfully", cart });
    } catch (err) { 
        res.status(500).json({ message: "Clear cart failed" }); 
    }
});

// ORDERS
app.post('/api/orders', protect, async (req, res) => {
    try {
        const { items, amount, userEmail, userName } = req.body;
        const order = await Order.create({ user: req.user._id, userEmail, userName, amount, items });
        
        const updateStockPromises = items.map(item => 
            Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } })
        );
        await Promise.all(updateStockPromises);
        
        res.status(201).json(order);
    } catch (err) { res.status(400).json({ message: "Order placement failed" }); }
});

app.get('/api/orders/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ message: "Fetch orders failed" }); }
});

app.put('/api/orders/:id/action', protect, async (req, res) => {
    try {
        const { action, reason } = req.body; 
        const order = await Order.findById(req.params.id);
        if (!order || order.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Unauthorized action." });

        if (action === 'cancel') {
            if (['Shipped', 'Delivered', 'Return Requested', 'Refunded', 'Cancelled'].includes(order.status)) {
                return res.status(400).json({ message: "Order cannot be cancelled at this stage." });
            }
            order.status = 'Cancelled';
            const restockPromises = order.items.map(item => 
                Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } })
            );
            await Promise.all(restockPromises);
        } else if (action === 'return') {
            if (order.status !== 'Delivered') return res.status(400).json({ message: "Order must be delivered to return." });
            
            if (order.deliveredAt && (Date.now() - new Date(order.deliveredAt).getTime()) / (1000 * 60 * 60 * 24) > 7) {
                return res.status(400).json({ message: "The 7-day return window has expired." });
            }
            order.status = 'Return Requested';
            order.returnReason = reason;
        }

        await order.save();
        res.json(order);
    } catch (err) { res.status(500).json({ message: "Action failed" }); }
});

// ADMIN MANAGEMENT & ANALYTICS
app.get('/api/admin/stats', protect, adminOnly, async (req, res) => {
    try {
        const [totalUsers, totalProducts, orders] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Order.find({})
        ]);
        const totalRevenue = orders.reduce((acc, curr) => !['Refunded', 'Cancelled'].includes(curr.status) ? acc + (Number(curr.amount) || 0) : acc, 0);
        res.json({ totalUsers, totalProducts, totalOrders: orders.length, totalRevenue });
    } catch (err) { res.status(500).json({ message: "Stats fetch failed" }); }
});

app.get('/api/admin/users', protect, adminOnly, async (req, res) => {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
});

app.delete('/api/admin/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.isAdmin) return res.status(400).json({ message: "Cannot delete an Admin account." });
        
        await Cart.findOneAndDelete({ user: req.params.id });
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User permanently removed." });
    } catch (err) { res.status(500).json({ message: "Delete failed" }); }
});

app.get('/api/admin/orders', protect, adminOnly, async (req, res) => {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
});

app.put('/api/admin/orders/:id/status', protect, adminOnly, async (req, res) => {
    try {
        const { status, returnReason } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (status === "Delivered" && order.status !== "Delivered") order.deliveredAt = Date.now();
        
        if (['Refunded', 'Cancelled'].includes(status) && !['Refunded', 'Cancelled'].includes(order.status)) {
            const restockPromises = order.items.map(item => 
                Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } })
            );
            await Promise.all(restockPromises);
        }
        
        order.status = status;
        if (returnReason) order.returnReason = returnReason;
        await order.save();
        res.json(order);
    } catch (err) { res.status(400).json({ message: "Status update failed" }); }
});

// NEWSLETTER
app.post('/api/newsletter', async (req, res) => {
    try {
        await Newsletter.create({ email: req.body.email });
        res.status(201).json({ message: "Subscribed" });
    } catch (err) { res.status(400).json({ message: "Already subscribed" }); }
});

app.get('/api/admin/newsletter', protect, adminOnly, async (req, res) => {
    const subs = await Newsletter.find().sort({ createdAt: -1 });
    res.json(subs);
});

// --- 6. Global Error Handling ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));