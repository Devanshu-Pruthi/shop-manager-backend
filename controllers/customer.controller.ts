import { Request, Response } from 'express';
import Customer from '../models/customer.model';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Public
export const getCustomers = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const keyword = req.query.keyword
            ? {
                $or: [
                    { name: { $regex: req.query.keyword as string, $options: 'i' } },
                    { phoneNumber: { $regex: req.query.keyword as string, $options: 'i' } },
                    { email: { $regex: req.query.keyword as string, $options: 'i' } },
                    { adharNumber: { $regex: req.query.keyword as string, $options: 'i' } }
                ]
            }
            : {};

        const total = await Customer.countDocuments(keyword);
        const customers = await Customer.find(keyword)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'name role');

        res.status(200).json({
            customers,
            page,
            pages: Math.ceil(total / limit),
            total,
            limit
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get customer statistics
// @route   GET /api/customers/stats
// @access  Public
export const getStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const totalCustomers = await Customer.countDocuments();

        // Aggregate phones sold and total revenue across ALL customers
        const stats = await Customer.aggregate([
            {
                $group: {
                    _id: null,
                    totalPhonesSold: { $sum: { $size: "$phones" } },
                    totalRevenue: { $sum: "$totalPurchaseAmount" }
                }
            }
        ]);

        const recentCustomers = await Customer.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('createdBy', 'name role');

        res.status(200).json({
            totalCustomers,
            totalPhonesSold: stats.length > 0 ? stats[0].totalPhonesSold : 0,
            totalRevenue: stats.length > 0 ? stats[0].totalRevenue : 0,
            recentCustomers
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Public
export const getCustomer = async (req: Request, res: Response): Promise<void> => {
    // ... existing getCustomer code is already there but I'll make sure it's accessible
    try {
        const customer = await Customer.findById(req.params.id).populate('createdBy', 'name role');
        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        res.status(200).json(customer);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const customerData = {
            ...req.body,
            createdBy: req.user?._id
        };
        const customer = await Customer.create(customerData);
        res.status(201).json(customer);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Public
export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        res.status(200).json(customer);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Public
export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        res.status(200).json({ message: 'Customer deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
