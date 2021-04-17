import { JWTPayload } from './jwt-payload.interface';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { UserRepository } from './user.repository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository) 
    private userRepository: UserRepository,
    private jwtService: JwtService
  ) {}

  async signUp(authCredentialsDTO: AuthCredentialsDTO): Promise<void> {
    return await this.userRepository.signUp(authCredentialsDTO)
  }

  async signIn(authCredentialsDTO: AuthCredentialsDTO): Promise<{ accessToken: string}> {
    const username = await this.userRepository.validateUserPassword(authCredentialsDTO)

    if(!username) {
      throw new UnauthorizedException('Invalid Credentials')
    }

    const payload: JWTPayload = { username }
    const accessToken = await this.jwtService.sign(payload)

    return { accessToken }
  }
}
