import mongoose from 'mongoose';
import User from '../models/user.model';

const seedAdmin = async () => {
    try {
        const adminId = '000000000000000000000001';
        const adminExists = await User.findById(adminId);

        if (!adminExists) {
            await User.create({
                _id: adminId,
                name: 'Admin User',
                email: 'admin@gmail.com',
                password: 'TaranMobiles@2955',
                role: 'admin'
            });
            console.log('Seed: Static Admin user created');
        }
    } catch (error) {
        console.error('Seed Error:', error);
    }
};

const connectDB = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        const conn = await mongoose.connect(mongoUri, {
            dbName: 'shopManager'
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Seed default admin
        await seedAdmin();
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
