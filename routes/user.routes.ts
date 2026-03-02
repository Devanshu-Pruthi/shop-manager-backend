import express, { Router } from 'express';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    loginUser
} from '../controllers/user.controller';

import { protect, admin } from '../middleware/auth.middleware';

const router: Router = express.Router();

router.post('/login', loginUser);

router.route('/')
    .get(protect, admin, getUsers)
    .post(protect, admin, createUser);

router.route('/:id')
    .get(protect, admin, getUser)
    .put(protect, admin, updateUser)
    .delete(protect, admin, deleteUser);

export default router;
