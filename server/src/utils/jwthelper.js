import jwt from 'jsonwebtoken';

const SECRET_KEY = "YOUR_SECRET_KEY";

interface User {
  _id: string;
  email: string;
}

export const generateToken = (user: User): string => {
  return jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
    expiresIn: '1h',
  });
};

export const verifyToken = (token: string): string | jwt.JwtPayload => {
  return jwt.verify(token, SECRET_KEY);
};
