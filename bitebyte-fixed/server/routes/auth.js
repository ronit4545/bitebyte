import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Generate Token Helper
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!db.data.settings.allowRegistration) {
    return res.status(403).json({ message: 'Public registration is currently disabled by administrator.' });
  }

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields: name, email, and password.' });
  }

  const existingUser = db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(409).json({ message: 'An account with this email address already exists.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = {
    id: 'usr-' + uuidv4().substr(0, 8),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    role: 'user',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    bio: 'Culinary explorer and food lover on BiteByte.',
    specialty: 'Home Cooking Enthusiast',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  db.data.users.push(newUser);
  db.logActivity('user_registered', newUser, `User "${newUser.name}" created a new account.`);
  db.save();

  const token = generateToken(newUser);
  const userSafe = { ...newUser };
  delete userSafe.passwordHash;

  res.status(201).json({
    message: 'Account registered successfully! Welcome to BiteByte.',
    token,
    user: userSafe
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter both email and password.' });
  }

  const user = db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ message: 'Your account is suspended. Please contact system admin.' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = generateToken(user);
  const userSafe = { ...user };
  delete userSafe.passwordHash;

  res.json({
    message: 'Welcome back, ' + user.name + '!',
    token,
    user: userSafe
  });
});

// Demo Login (Instant evaluation switch between Admin and standard User)
router.post('/demo-login', (req, res) => {
  const { role } = req.body; // 'admin' or 'user'
  let targetUser;

  if (role === 'admin') {
    targetUser = db.data.users.find(u => u.role === 'admin') || db.data.users[0];
  } else {
    targetUser = db.data.users.find(u => u.role === 'user') || db.data.users[1];
  }

  if (!targetUser) {
    return res.status(404).json({ message: 'Requested demo user not found.' });
  }

  const token = generateToken(targetUser);
  const userSafe = { ...targetUser };
  delete userSafe.passwordHash;

  res.json({
    message: `Switched session to ${targetUser.role.toUpperCase()}: ${targetUser.name}`,
    token,
    user: userSafe
  });
});

// Get Current User Profile
router.get('/me', authenticateToken, (req, res) => {
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  const userSafe = { ...user };
  delete userSafe.passwordHash;
  res.json(userSafe);
});

// Profile Management: Form for updating personal information and preferences
router.put('/profile', authenticateToken, (req, res) => {
  const { name, bio, specialty, avatar } = req.body;
  const userIndex = db.data.users.findIndex(u => u.id === req.user.id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const user = db.data.users[userIndex];
  if (name) user.name = name.trim();
  if (bio !== undefined) user.bio = bio.trim();
  if (specialty !== undefined) user.specialty = specialty.trim();
  if (avatar) user.avatar = avatar.trim();

  // Also update author info on user's existing recipes
  db.data.recipes.forEach(r => {
    if (r.authorId === user.id) {
      r.authorName = user.name;
      r.authorAvatar = user.avatar;
    }
  });

  // Also update commenter info
  db.data.ratings.forEach(rat => {
    if (rat.userId === user.id) {
      rat.userName = user.name;
      rat.userAvatar = user.avatar;
    }
  });

  db.save();
  db.logActivity('user_updated', user, `User "${user.name}" updated their profile details.`);

  const userSafe = { ...user };
  delete userSafe.passwordHash;

  // Output: Confirmation message for successful profile update
  res.json({
    message: 'Profile details updated successfully!',
    user: userSafe
  });
});

// Password Update
router.put('/password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide current and new passwords.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
  }

  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ message: 'Current password does not match.' });
  }

  const salt = bcrypt.genSaltSync(10);
  user.passwordHash = bcrypt.hashSync(newPassword, salt);
  db.save();

  res.json({ message: 'Password has been updated successfully!' });
});

export default router;
