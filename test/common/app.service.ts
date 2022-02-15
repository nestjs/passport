import {
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppService {
  private users = [
    {
      id: '1',
      username: 'test1',
      password: 'test'
    },
    {
      id: '2',
      username: 'nottest1',
      password: 'secret'
    }
  ];
  constructor(private readonly jwtService: JwtService) {}
  getHello() {
    return { message: 'Hello open world!' };
  }

  getPrivateMessage() {
    return { message: 'Hello secure world!' };
  }

  getToken({ username, id }: { username: string; id: string }): {
    token: string;
  } {
    return { token: this.jwtService.sign({ username, id }) };
  }

  findUser({ username, password }: { username: string; password: string }): {
    id: string;
    username: string;
  } {
    const user = this.users.find((u) => u.username === username);
    if (!user || user.password !== password) {
      return null;
    }
    return user;
  }
}
