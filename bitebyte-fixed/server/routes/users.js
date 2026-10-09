import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply auth & admin middlewares to all user management routes
router.use(authenticateToken);
router.use(requireAdmin);

// 1. User Management: Table listing user accounts with options for editing and deleting
router.get('/', (req, res) => {
  const users = db.data.users.map(u => {
    const userSafe = { ...u };
    delete userSafe.passwordHash;
    // Calculate stats
    const recipeCount = db.data.recipes.filter(r => r.authorId === u.id).length;
    const ratingCount = db.data.ratings.filter(r => r.userId === u.id).length;
    return {
      ...userSafe,
      recipesCount: recipeCount,
      ratingsCount: ratingCount
    };
  });

  res.json(users);
});

// Admin creates user:
// Input: User details (name, email, role)
// Output: Confirmation message for successful user creation
router.post('/', (req, res) => {
  const { name, email, role, password } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'User name and email are required.' });
  }

  const existing = db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'A user with this email address already exists.' });
  }

  const userPassword = password || 'BiteByte123!';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(userPassword, salt);

  const newUser = {
    id: 'usr-' + uuidv4().substr(0, 8),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    role: role === 'admin' ? 'admin' : 'user',
    bio: 'BiteByte member',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    specialty: 'Home Chef',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  db.data.users.push(newUser);
  db.logActivity('user_registered', req.user, `Admin created user account for "${newUser.name}" (${newUser.role}).`);
  db.save();

  const userSafe = { ...newUser };
  delete userSafe.passwordHash;

  res.status(201).json({
    message: 'User account created successfully!',
    user: userSafe
  });
});

// Admin updates user:
// Input: User details (name, email, role, status)
// Output: Confirmation message for successful user update
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, role, status, specialty } = req.body;

  const userIndex = db.data.users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User account not found.' });
  }

  const user = db.data.users[userIndex];

  // Prevent admin from revoking their own admin role or disabling themselves
  if (req.user.id === id && role && role !== 'admin') {
    return res.status(400).json({ message: 'You cannot revoke your own administrator privileges.' });
  }

  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    const emailExists = db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== id);
    if (emailExists) {
      return res.status(409).json({ message: 'Email is already used by another user.' });
    }
    user.email = email.trim().toLowerCase();
  }

  if (name) user.name = name.trim();
  if (role && (role === 'admin' || role === 'user')) user.role = role;
  if (status && (status === 'active' || status === 'suspended')) user.status = status;
  if (specialty !== undefined) user.specialty = specialty.trim();

  db.save();
  db.logActivity('user_updated', req.user, `Admin updated user details for "${user.name}".`);

  const userSafe = { ...user };
  delete userSafe.passwordHash;

  res.json({
    message: 'User account updated successfully!',
    user: userSafe
  });
});

// Admin deletes user:
// Output: Confirmation message for successful user deletion
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  if (req.user.id === id) {
    return res.status(400).json({ message: 'You cannot delete your own administrator account.' });
  }

  const userIndex = db.data.users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User account not found.' });
  }

  const deletedUser = db.data.users[userIndex];
  db.data.users.splice(userIndex, 1);

  // Optionally clean up or mark orphaned items
  db.save();
  db.logActivity('user_deleted', req.user, `Admin deleted user account for "${deletedUser.name}".`);

  res.json({
    message: 'User account deleted successfully!'
  });
});

export default router;
