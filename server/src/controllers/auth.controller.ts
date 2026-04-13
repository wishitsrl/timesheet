import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { AuthRequest } from '../types/authRequest';
import Joi from 'joi';

export const signup = async (req: Request, res: Response) => {
  try {
    const schema = Joi.object({
      firstName: Joi.string().max(50).required(),
      lastName: Joi.string().max(50).required(),
      email: Joi.string().email().max(100).required(),
      password: Joi.string().min(6).max(100).required(),
      role: Joi.string().valid('USER', 'ADMIN').optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { firstName, lastName, email, password, role = 'USER' } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'Email is already registered' });

    const fullName = `${firstName} ${lastName}`;

    const newUser = new User({
      firstName,
      lastName,
      fullName,
      email,
      password,
      role,
      isActive: false,
    });

    await newUser.save();

    const { password: pwd, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({ message: 'User registered successfully', user: userWithoutPassword });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().max(100).required(),
      password: Joi.string().min(6).max(100).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Email o password non validi" });

    const validPassword = await user.comparePassword(password);
    if (!validPassword) return res.status(401).json({ message: "Email o password non validi" });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        isActive: user.isActive,
      },
      process.env.API_SECRET!,
      { expiresIn: "1h", algorithm: "HS256" }
    );

    user.accessToken = token;
    await user.save();

    const { password: pwd, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      ...userWithoutPassword,
      accessToken: token,
    });
  } catch (err: any) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Errore del server", error: err.message });
  }
};

export const signout = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'User not logged in' });

    req.user.accessToken = '';
    await req.user.save();

    res.status(200).json({ message: 'Logout successful' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(password, 8);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.accessToken = '';

    await user.save();
    res.status(200).json({ message: 'Password updated successfully! You can now log in.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error while resetting password', error: error.message });
  }
};

export const refreshToken = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'User not logged in' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.API_SECRET!,
      { expiresIn: '1h' }
    );

    user.accessToken = token;
    await user.save();

    res.status(200).json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      accessToken: token
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};