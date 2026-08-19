import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/auth.js';

export const signToken = (payload) => {
  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn,
  });
};
