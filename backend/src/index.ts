import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import { getDashboardStats, getMonthlyRevenue } from './controllers/dashboard.controller';
import { getAllRooms, createRoom, updateRoom } from './controllers/room.controller';
import { getAllCruiseTrips, getCruiseDetails, createCruise, createCruiseHistory } from './controllers/cruise.controller';
import { getAllStaff, createStaff, removeStaff, updateStaff } from './controllers/staff.controller';
import { getAllActivities, createActivity, updateActivity, deleteActivity } from './controllers/activity.controller';
import { authMiddleware } from './middleware/auth';
import { AppError } from './utils/errors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api', authMiddleware);

// Dashboard
app.get('/api/dashboard/stats', getDashboardStats);
app.get('/api/dashboard/monthly-revenue', getMonthlyRevenue);

// Rooms
app.get('/api/rooms', getAllRooms);
app.post('/api/rooms', createRoom);
app.put('/api/rooms/:id', updateRoom);

// Cruises
app.get('/api/cruises', getAllCruiseTrips);
app.post('/api/cruises/history', createCruiseHistory);  // Specialized route for history
app.get('/api/cruises/:id', getCruiseDetails);
app.post('/api/cruises', createCruise);

// Staff
app.get('/api/staff', getAllStaff);
app.post('/api/staff', createStaff);
app.put('/api/staff/:id', updateStaff);
app.delete('/api/staff/:id', removeStaff);

// Activities
app.get('/api/activities', getAllActivities);
app.post('/api/activities', createActivity);
app.put('/api/activities/:id', updateActivity);
app.delete('/api/activities/:id', deleteActivity);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
