import express, { Router } from 'express';
import {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getStats
} from '../controllers/customer.controller';

import { protect } from '../middleware/auth.middleware';

const router: Router = express.Router();

router.get('/stats', getStats);
router.route('/').get(getCustomers).post(protect, createCustomer);
router.route('/:id').get(getCustomer).put(updateCustomer).delete(deleteCustomer);

export default router;
