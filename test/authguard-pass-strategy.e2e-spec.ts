import {
  Controller,
  Get,
  INestApplication,
  Req,
  UseGuards
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as passport from 'passport';
import { Strategy } from 'passport-strategy';
import { request, spec } from 'pactum';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthGuard, PassportModule } from '../lib';

const STRATEGY_NAME = 'pass-through';

class PassThroughStrategy extends Strategy {
  name = STRATEGY_NAME;

  authenticate(req: any) {
    req.user = { id: 'restored-from-strategy' };
    this.pass();
  }
}

@Controller()
class DefaultPassThroughController {
  @UseGuards(AuthGuard(STRATEGY_NAME))
  @Get('pass-through')
  getUser(@Req() req: any) {
    return { user: req.user ?? null };
  }
}

describe('AuthGuard with pass-through strategies', () => {
  describe.each`
    description        | options                                 | expectedUser
    ${'by default'}    | ${{}}                                   | ${null}
    ${'when opted in'} | ${{ preserveExistingUserOnPass: true }} | ${{ id: 'restored-from-strategy' }}
  `('$description', ({ options, expectedUser }) => {
    let app: INestApplication;

    beforeAll(async () => {
      passport.use(new PassThroughStrategy());

      const modRef = await Test.createTestingModule({
        controllers: [DefaultPassThroughController],
        imports: [PassportModule.register(options)]
      }).compile();
      app = modRef.createNestApplication();
      await app.listen(0);
      const url = (await app.getUrl()).replace('[::1]', 'localhost');
      request.setBaseUrl(url);
    });

    it('should handle request user restored by a pass-through strategy', async () => {
      await spec().get('/pass-through').expectStatus(200).expectBody({
        user: expectedUser
      });

      expect.assertions(0);
    });

    afterAll(async () => {
      passport.unuse(STRATEGY_NAME);
      await app.close();
    });
  });
});
