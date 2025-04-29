require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Initialize Express app
const app = express();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// CORS configuration with flexible frontend URL support
const allowedOrigins = [
  'http://localhost:5173', // Local development
  'https://organizo-s7qr.onrender.com' // Updated Render production URL
];

// Add production frontend URL if defined in environment variables
if (process.env.FRONTEND_URL) {
  // Support for multiple comma-separated URLs
  const frontendUrls = process.env.FRONTEND_URL.split(',').map(url => url.trim());
  allowedOrigins.push(...frontendUrls);
}

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log(`Origin blocked by CORS: ${origin}`);
      // During initial deployment/testing, allow all origins
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'user-id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log('Headers:', {
    userId: req.headers['user-id'] || 'Not provided',
    origin: req.headers.origin || 'Not provided'
  });
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', environment: process.env.NODE_ENV });
});

// Task routes
app.get('/api/tasks', async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.post('/api/tasks', async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) throw new Error('User ID is required');

    const taskData = {
      ...req.body,
      user_id: userId
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
});

app.put('/api/tasks/:id', async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await supabase
      .from('tasks')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) throw new Error('User ID is required');

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', userId);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Transaction routes
app.get('/api/transactions', async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.post('/api/transactions', async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) throw new Error('User ID is required');

    const { type, amount, description, date, tag } = req.body;

    // Validate required fields
    if (!type || !amount || !description || !date) {
      throw new Error('Missing required fields: type, amount, description, and date are required');
    }

    // Validate type
    if (!['spend', 'invest', 'receive'].includes(type)) {
      throw new Error('Invalid transaction type. Must be spend, invest, or receive');
    }

    // Validate tag based on type
    const validTags = {
      spend: ['food', 'travel', 'subscriptions', 'shopping', 'misc'],
      invest: ['investment', 'savings'],
      receive: ['income', 'refund', 'other']
    };

    if (tag && !validTags[type].includes(tag)) {
      throw new Error(`Invalid tag for type ${type}. Valid tags are: ${validTags[type].join(', ')}`);
    }

    const transactionData = {
      type,
      amount: parseFloat(amount),
      description,
      date,
      tag,
      user_id: userId
    };

    console.log('Creating transaction:', transactionData);

    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select();

    if (error) throw error;
    
    console.log('Transaction created:', data[0]);
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Transaction creation error:', error);
    next(error);
  }
});

// User settings routes
app.get('/api/user-settings', async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    // If no settings exist, create default settings
    if (!data) {
      const defaultSettings = {
        user_id: userId,
        monthly_income: 0,
        savings_goal: 0
      };

      const { data: newData, error: insertError } = await supabase
        .from('user_settings')
        .insert([defaultSettings])
        .select()
        .single();

      if (insertError) throw insertError;
      res.json(newData);
    } else {
      res.json(data);
    }
  } catch (error) {
    next(error);
  }
});

app.put('/api/user-settings', async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await supabase
      .from('user_settings')
      .upsert({ ...req.body, user_id: userId })
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    code: err.code,
    details: err.details,
    path: req.path,
    method: req.method,
    userId: req.headers['user-id'],
    timestamp: new Date().toISOString()
  });

  if (err.message === 'User ID is required') {
    return res.status(401).json({
      message: 'Authentication required'
    });
  }

  // Supabase error handling
  if (err.code) {
    if (err.code === '22P02') {
      return res.status(400).json({
        message: 'Invalid input type',
        details: err.details
      });
    }
    if (err.code === '23505') {
      return res.status(409).json({
        message: 'Duplicate record',
        details: err.details
      });
    }
    if (err.code === '42P01') {
      return res.status(500).json({
        message: 'Database table not found',
        details: err.details
      });
    }
    return res.status(400).json({
      message: err.message,
      code: err.code,
      details: err.details
    });
  }

  // Default error response
  res.status(500).json({
    message: process.env.NODE_ENV === 'development'
      ? `${err.message}\n${err.stack}`
      : 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});