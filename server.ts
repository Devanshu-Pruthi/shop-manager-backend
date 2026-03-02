import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import https from 'node:https';
import customerRoutes from './routes/customer.routes';
import userRoutes from './routes/user.routes';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

// Keep-alive mechanism for production (e.g., Render/Heroku)
if (process.env.NODE_ENV === "production") {
    const BACKEND_URL = process.env.BACKEND_URL || `https://shop-manager-backend.onrender.com`;

    // Ping the server every 14 minutes (840,000 ms)
    setInterval(() => {
        https.get(BACKEND_URL, (res) => {
            console.log(`Keep-alive ping status: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error(`Keep-alive ping error: ${err.message}`);
        });
    }, 840000);
    console.log(`🚀 Keep-alive active for: ${BACKEND_URL}`);
} else {
    console.log("⚠️  Not keeping server alive in non-production environment");
}

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
