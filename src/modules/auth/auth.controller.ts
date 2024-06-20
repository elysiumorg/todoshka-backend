import { Response } from 'express';

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { JwtRefreshPayload } from './strategies/refresh-token.strategy';

@Controller('/auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/signup')
  @ApiBearerAuth('Authorization')
  async signUp(@Res() res: Response, @Body(ValidationPipe) user: SignupDto) {
    const tokens = await this.authService.signUp(user);

    res.cookie('rt', tokens.refreshToken, {
      expires: new Date(Date.now() + 1296000000),
      httpOnly: true,
      secure: true,
    });
    res.cookie('at', tokens.accessToken, {
      expires: new Date(Date.now() + 900000),
      httpOnly: true,
      secure: true,
    });

    res.send(tokens);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/signin')
  @ApiBearerAuth('Authorization')
  async signIn(@Res() res: Response, @Body(ValidationPipe) user: SigninDto) {
    const tokens = await this.authService.signIn(user);

    res.cookie('rt', tokens.refreshToken, {
      expires: new Date(Date.now() + 1296000000),
      httpOnly: true,
      secure: true,
    });
    res.cookie('at', tokens.accessToken, {
      expires: new Date(Date.now() + 900000),
      httpOnly: true,
      secure: true,
    });

    res.send(tokens);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('/logout')
  logout(@CurrentUser() payload: JwtRefreshPayload) {
    return this.authService.logout(payload._id, payload.refreshToken);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('/refresh')
  async refreshTokens(
    @Res() res: Response,
    @CurrentUser() payload: JwtRefreshPayload,
  ) {
    const tokens = await this.authService.refreshTokens(
      payload._id,
      payload.refreshToken,
    );

    res.cookie('rt', tokens.refreshToken, {
      expires: new Date(Date.now() + 1296000000),
      httpOnly: true,
      secure: true,
    });
    res.cookie('at', tokens.accessToken, {
      expires: new Date(Date.now() + 900000),
      httpOnly: true,
      secure: true,
    });

    res.send();
  }
}
