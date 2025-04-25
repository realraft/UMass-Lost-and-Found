import User from '../models/User.js';

const users = [];
let nextUserId = 1;

export const getUserById = (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = users.find(user => user.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error: error.message });
  }
};

export const registerUser = (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    
    if (users.some(user => user.email === email)) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    const newUser = new User({
      id: nextUserId++,
      username,
      email,
      password,
      role: 'user'
    });
    
    users.push(newUser);
    
    const { password: pwd, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const loginUser = (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = users.find(user => user.email === email);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const { password: pwd, ...userWithoutPassword } = user;
    res.status(200).json({ 
      message: 'Login successful',
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const updateUser = (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { username, email } = req.body;
    
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (username) users[userIndex].username = username;
    if (email) users[userIndex].email = email;
    
    users[userIndex].updatedAt = new Date();
    
    const { password, ...userWithoutPassword } = users[userIndex];
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

export const deleteUser = (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    users.splice(userIndex, 1);
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};