import { Controller, Post, Body } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() body: { id?: string; name?: string }) {
    const userId = (body?.id || '7').toString();
    const name = body?.name || 'Você';
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const token = jwt.sign({ id: userId, name }, secret, { expiresIn: '1h' });
    return { token, userId, name };
  }
}

