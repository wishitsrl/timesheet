import bcrypt from 'bcryptjs';
import { Response } from 'express';
import User from '../models/user.model';
import { AuthRequest } from '../types/authRequest';
import { UserRole } from '../types/roles.enum';
import fs from 'fs';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Access denied: admin only' });
    }

    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const sortFieldRaw = typeof req.query.sort === 'string' ? req.query.sort : 'createdAt';
    const order = typeof req.query.order === 'string' ? req.query.order : 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const allowedSortFields = ['createdAt', 'fullName', 'email'];
    const sortField = allowedSortFields.includes(sortFieldRaw) ? sortFieldRaw : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const users = await User.find(filter)
      .select('-password -accessToken')
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};

	export const getProfile = async (req: AuthRequest, res: Response) => {
		try {
			if (!req.user?._id) return res.status(401).json({ message: 'Not authenticated' });

			const user = await User.findById(req.user._id).select('-password -accessToken');
			if (!user) return res.status(404).json({ message: 'User not found' });

			res.status(200).json({ user });
		} catch (error: any) {
			res.status(500).json({ message: 'Profile recovery error', error: error.message });
		}
	};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const updates = { ...req.body };

    delete updates.role;
    delete updates.password;
    delete updates.accessToken;

    if (updates.firstName || updates.lastName) {
      const user = await User.findById(userId).select('firstName lastName');
      if (user) {
        const newFirstName = updates.firstName ?? user.firstName;
        const newLastName = updates.lastName ?? user.lastName;
        updates.fullName = `${newFirstName} ${newLastName}`;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password -accessToken');
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ message: 'Profile update error', error: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Mandatory fields missing' });

    const passwordSchema = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordSchema.test(newPassword)) {
      return res.status(400).json({ message: 'The new password must contain at least 8 characters, one letter and one number' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 8);

    user.accessToken = '';
    await user.save();

    res.status(200).json({ message: 'Password updated successfully. Please log in again' });
  } catch (error: any) {
    res.status(500).json({ message: 'Errore durante il cambio password', error: error.message });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Only ADMIN can change roles' });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password -accessToken');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Role successfully updated', user });
  } catch (error: any) {
    res.status(500).json({ message: 'Role update error', error: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (req.user?.role !== UserRole.ADMIN && req.user?._id.toString() !== id) {
      return res.status(403).json({ message: 'Action not allowed' });
    }

    if (req.user?.role === UserRole.ADMIN && req.user._id.toString() === id) {
      return res.status(400).json({ message: 'You cannot delete your account from here.' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json({ message: 'User and their pets successfully deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

export const activateUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Only ADMIN can change user status' });
    }

    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be boolean' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password -accessToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });

  } catch (error: any) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
};