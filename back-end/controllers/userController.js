import User from '../models/User.js';

// In-memory user storage for demonstration
// In a real app, this would use a database
const users = [];
let nextUserId = 1;

// Get user by ID
export const getUserById = (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = users.find(user => user.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send password in response
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error: error.message });
  }
};

// Register new user
export const registerUser = (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if required fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    
    // Check if user with the same email already exists
    if (users.some(user => user.email === email)) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create new user
    const newUser = new User({
      id: nextUserId++,
      username,
      email,
      password, // In a real app, this should be hashed
      role: 'user'
    });
    
    users.push(newUser);
    
    // Don't send password in response
    const { password: pwd, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Login user
export const loginUser = (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if required fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = users.find(user => user.email === email);
    
    // Check if user exists and password is correct
    if (!user || user.password !== password) { // In a real app, use proper password comparison
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Don't send password in response
    const { password: pwd, ...userWithoutPassword } = user;
    res.status(200).json({ 
      message: 'Login successful',
      user: userWithoutPassword,
      // In a real app, you would generate and return a token here
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Update user
export const updateUser = (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { username, email } = req.body;
    
    // Find user by ID
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields if provided
    if (username) users[userIndex].username = username;
    if (email) users[userIndex].email = email;
    
    users[userIndex].updatedAt = new Date();
    
    // Don't send password in response
    const { password, ...userWithoutPassword } = users[userIndex];
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete user
export const deleteUser = (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Find user by ID
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove user from array
    users.splice(userIndex, 1);
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};