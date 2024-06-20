import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { TransporterService } from '~modules/transporter/transporter.service';
import { UsersService } from '~modules/users/users.service';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';

import { Auth, AuthDocument } from './auth.schema';
import { SigninDto } from './dto/signin.dto';
import { Role } from './enums/role.enum';

import { CreateUserDto } from '../users/dto/create-user.dto';

type Payload = {
  _id: string;
  email: string;
  roles: Role[];
};

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private transporterService: TransporterService,
  ) {}

  async signUp(
    createUserDto: CreateUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const userExists = await this.usersService.findByEmail(createUserDto.email);

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const approveCode = uuidv4();

    this.transporterService.sendMail({
      to: createUserDto.email,
      subject: 'Подтверждение учетной записи',
      html: `<p>Чтобы подтвердить свою учетную запись, перейдите по ссылке: ${process.env.FRONTEND_URL}/approve/${approveCode}</p>`,
    });

    const hash = await this.hashData(createUserDto.password);
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hash,
    });

    const payload = {
      _id: newUser._id,
      email: newUser.email,
      roles: newUser.roles,
    };
    return await this.updateRefreshToken(newUser._id, payload);
  }

  async signIn(data: SigninDto) {
    if (!data.email && !data.login)
      throw new BadRequestException('Email or login is required');

    const userFromEmail =
      data.email && (await this.usersService.findByEmail(data.email));
    const userFromLogin =
      data.login && (await this.usersService.findByLogin(data.login));
    const user = userFromEmail || userFromLogin;
    if (!user) throw new BadRequestException('User does not exist');

    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');

    const payload: Payload = {
      _id: user._id,
      email: user.email,
      roles: user.roles,
    };

    return await this.updateRefreshToken(user._id, payload);
  }

  async logout(userId: string, refreshToken: string) {
    const update = await this.authModel.findOneAndUpdate(
      { user: userId },
      { $pull: { refreshTokens: refreshToken } },
    );
    return { success: !!update };
  }

  async removeAllRefreshTokens(userId: string) {
    const update = await this.authModel.findOneAndUpdate(
      { user: userId },
      { refreshTokens: [] },
    );
    return { success: !!update };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const auth = await this.authModel
      .findOne({ user: userId })
      .populate('user');
    if (!auth || !auth.refreshTokens.includes(refreshToken))
      throw new ForbiddenException('Access Denied');
    const payload: Payload = {
      _id: auth.user._id,
      email: auth.user.email,
      roles: auth.user.roles,
    };
    await this.logout(auth.user._id, refreshToken);
    return await this.updateRefreshToken(auth.user._id, payload);
  }

  async hashData(data: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(data, salt);
  }

  async updateRefreshToken(userId: string, payload: Payload) {
    const tokens = await this.getTokens(payload);

    await this.authModel.updateOne(
      { user: userId },
      { $addToSet: { refreshTokens: tokens.refreshToken } },
      { upsert: true },
    );

    return tokens;
  }

  private getConfProp(key: string) {
    return this.configService.get<string>(key);
  }

  async getTokens(payload: Payload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.getConfProp('JWT_ACCESS_SECRET'),
        expiresIn: this.getConfProp('JWT_ACCESS_EXPIRES') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.getConfProp('JWT_REFRESH_SECRET'),
        expiresIn: this.getConfProp('JWT_REFRESH_EXPIRES') || '15d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
