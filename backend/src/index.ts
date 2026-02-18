import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import { getDashboardStats, getMonthlyRevenue } from './controllers/dashboard.controller';
import { getAllRooms, createRoom, updateRoom, deleteRoom, getAllCategories, updateCategory } from './controllers/room.controller';
import { getAllCruiseTrips, getCruiseDetails, createCruise, createCruiseHistory, updateCruiseHistory, archiveCruise, deleteCruise } from './controllers/cruise.controller';
import { getAllStaff, createStaff, removeStaff, updateStaff } from './controllers/staff.controller';
import { getAllActivities, createActivity, updateActivity, deleteActivity } from './controllers/activity.controller';
import { authMiddleware } from './middleware/auth';
import { AppError } from './utils/errors';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', authMiddleware);

app.get('/api/dashboard/stats', getDashboardStats);
app.get('/api/dashboard/monthly-revenue', getMonthlyRevenue);

app.get('/api/rooms', getAllRooms);
app.post('/api/rooms', createRoom);
app.put('/api/rooms/:id', updateRoom);
app.delete('/api/rooms/:id', deleteRoom);

app.get('/api/room-categories', getAllCategories);
app.put('/api/room-categories/:id', updateCategory);

app.get('/api/cruises', getAllCruiseTrips);
app.post('/api/cruises/history', createCruiseHistory);
app.put('/api/cruises/:id/archive', archiveCruise);
app.put('/api/cruises/:id/history', updateCruiseHistory);
app.get('/api/cruises/:id', getCruiseDetails);
app.post('/api/cruises', createCruise);
app.delete('/api/cruises/:id', deleteCruise);

app.get('/api/staff', getAllStaff);
app.post('/api/staff', createStaff);
app.put('/api/staff/:id', updateStaff);
app.delete('/api/staff/:id', removeStaff);

app.get('/api/activities', getAllActivities);
app.post('/api/activities', createActivity);
app.put('/api/activities/:id', updateActivity);
app.delete('/api/activities/:id', deleteActivity);

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err);
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
