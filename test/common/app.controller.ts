import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../lib';

import { AppService } from './app.service';
import { CustomGuard } from './custom.strategy';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('private')
  getPrivateHello() {
    return this.appService.getPrivateMessage();
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: any, @Body() body: Record<string, string>) {
    return this.appService.getToken({
      username: body.username,
      id: req.user.id
    });
  }

  @UseGuards(AuthGuard('custom'))
  @Get('custom-guard')
  getCustom(@Req() req: any) {
    return req.user.state;
  }

  @UseGuards(CustomGuard)
  @Get('custom-guard-with-state')
  getCustomWithState(@Req() req: any) {
    return req.user.state;
  }
}
