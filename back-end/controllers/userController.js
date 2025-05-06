import User from '../models/User.js';

export const getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userJson = user.toJSON();
    delete userJson.password;
    res.status(200).json({ success: true, data: userJson });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
    }
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }
    
    const newUser = await User.create({
      username,
      email,
      password,
      role: 'user'
    });
    
    const userJson = newUser.toJSON();
    delete userJson.password;
    res.status(201).json({ success: true, data: userJson });
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ where: { email } });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const userJson = user.toJSON();
    delete userJson.password;
    res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      data: userJson
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { username, email } = req.body;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (username) user.username = username;
    if (email) user.email = email;
    
    await user.save();
    
    const userJson = user.toJSON();
    delete userJson.password;
    res.status(200).json({ success: true, data: userJson });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    await user.destroy();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};