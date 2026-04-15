import jwt from 'jsonwebtoken';
import env from '../config/index.js';
import { userRepository } from '../repositories/user.repository.js';
import { registerSchema, loginSchema } from '@csirs/shared/schemas';
import { RegisterInput, LoginInput, JwtPayload } from '@csirs/shared/types';
//import { ApiError } from '@csirs/shared/types';

export class AuthService {
  static async register(data: RegisterInput) {
    const validated = registerSchema.parse(data);

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(validated.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user (repository handles hashing)
    const newUser = await userRepository.createUser({
      email: validated.email,
      password: validated.password,
      name: validated.name,
      role: validated.role,
    });

    // Generate tokens
    const tokens = AuthService.generateTokens(newUser);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      ...tokens,
    };
  }

  static async login(data: LoginInput) {
    const validated = loginSchema.parse(data);

    const user = await userRepository.findByEmail(validated.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await userRepository.verifyPassword(user.password, validated.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = AuthService.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  private static generateTokens(user: any) {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken, // Will be set as httpOnly cookie in controller
    };
  }

       static async refreshToken(refreshToken: string) {
       try {
         const payload = jwt.verify(refreshToken, env.JWT_SECRET) as JwtPayload;

         // Issue new access token (short lived)
         const newAccessToken = jwt.sign(
           { userId: payload.userId, email: payload.email, role: payload.role },
           env.JWT_SECRET,
           { expiresIn: '15m' }
         );

         return { accessToken: newAccessToken };
       } catch (err) {
         throw new Error('Invalid or expired refresh token');
       }
     }
}