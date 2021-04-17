import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { EntityRepository, Repository } from "typeorm";
import { User } from "./user.entity";
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async signUp(authCredentials: AuthCredentialsDTO): Promise<void> {
    const {username,password} = authCredentials

    const salt = await bcrypt.genSalt()

    const user = new User()
    user.username = username
    user.password = await this.hashPassword(password, salt)

    try {
      await user.save()
    } catch (error) {
      if(error.code === '23505') {
        throw new ConflictException('Username already exists')
      } else {
        throw new InternalServerErrorException()
      }
    }
    
  }

  async validateUserPassword(authCredentialsDTO: AuthCredentialsDTO): Promise<string> {
    const {username, password} = authCredentialsDTO
    const user = await this.findOne({ username })

    if(user && user.validatePassword(password)) {
      return user.username
    }

    return null
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt)
  }
}