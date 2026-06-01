import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../lib';

@Controller()
export class OptionsCheckController {
  @UseGuards(AuthGuard())
  @Get('options-check')
  checkOptions(@Req() req: any) {
    return {
      account: req.account,
      authInfo: req.authInfo,
      user: req.user ?? null
    };
  }
}
