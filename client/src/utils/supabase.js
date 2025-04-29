import api from './api';

// Task related functions
export const getTasks = async () => {
  try {
    const data = await api.tasks.getAll();
    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const createTask = async (task) => {
  try {
    const data = await api.tasks.create(task);
    return data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (id, updates) => {
  try {
    const data = await api.tasks.update(id, updates);
    return data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    await api.tasks.delete(id);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Transaction related functions
export const getTransactions = async () => {
  try {
    const data = await api.transactions.getAll();
    return data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const createTransaction = async (transaction) => {
  try {
    const data = await api.transactions.create(transaction);
    return data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

export const updateTransaction = async (id, updates) => {
  try {
    const data = await api.transactions.update(id, updates);
    return data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (id) => {
  try {
    await api.transactions.delete(id);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// User settings
export const getUserSettings = async () => {
  try {
    const data = await api.userSettings.get();
    return data;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
};

export const updateUserSettings = async (settings) => {
  try {
    const data = await api.userSettings.update(settings);
    return data;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};