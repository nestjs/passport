import {
  Controller,
  Get,
  INestApplication,
  Req,
  UseGuards
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import passport from 'passport';
import { request, spec } from 'pactum';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthGuard, PassportModule } from '../lib/index.js';

const STRATEGY_NAME = 'pass-through';
const CUSTOM_PROPERTY_STRATEGY_NAME = 'pass-through-custom-property';
const SUCCESS_STRATEGY_NAME = 'success';
const FAIL_STRATEGY_NAME = 'fail';

class PassThroughStrategy extends passport.Strategy {
  name = STRATEGY_NAME;

  authenticate(req: any) {
    req.user = { id: 'restored-from-strategy' };
    this.pass();
  }
}

class CustomPropertyPassThroughStrategy extends passport.Strategy {
  name = CUSTOM_PROPERTY_STRATEGY_NAME;

  authenticate(req: any) {
    req.account = { id: 'custom-property-user' };
    this.pass();
  }
}

class SuccessStrategy extends passport.Strategy {
  name = SUCCESS_STRATEGY_NAME;

  authenticate(req: any) {
    req.user = { id: 'existing-user' };
    this.success({ id: 'authenticated-user' });
  }
}

class FailStrategy extends passport.Strategy {
  name = FAIL_STRATEGY_NAME;

  authenticate(req: any) {
    req.user = { id: 'existing-user' };
    this.fail();
  }
}

class ReturnUndefinedGuard extends AuthGuard(SUCCESS_STRATEGY_NAME) {
  handleRequest() {
    return undefined;
  }
}

@Controller()
class DefaultPassThroughController {
  @UseGuards(AuthGuard(STRATEGY_NAME))
  @Get('pass-through')
  getUser(@Req() req: any) {
    return { user: req.user ?? null };
  }

  @UseGuards(AuthGuard(CUSTOM_PROPERTY_STRATEGY_NAME))
  @Get('pass-through-custom-property')
  getAccount(@Req() req: any) {
    return { account: req.account ?? null };
  }

  @UseGuards(ReturnUndefinedGuard)
  @Get('return-undefined')
  getUndefinedUser(@Req() req: any) {
    return { user: req.user ?? null };
  }

  @UseGuards(AuthGuard(SUCCESS_STRATEGY_NAME))
  @Get('success')
  getSuccessUser(@Req() req: any) {
    return { user: req.user ?? null };
  }

  @UseGuards(AuthGuard(FAIL_STRATEGY_NAME))
  @Get('fail')
  getFailureUser(@Req() req: any) {
    return { user: req.user ?? null };
  }
}

describe('AuthGuard with pass-through strategies', () => {
  beforeAll(() => {
    passport.use(new PassThroughStrategy());
    passport.use(new CustomPropertyPassThroughStrategy());
    passport.use(new SuccessStrategy());
    passport.use(new FailStrategy());
  });

  afterAll(() => {
    passport.unuse(STRATEGY_NAME);
    passport.unuse(CUSTOM_PROPERTY_STRATEGY_NAME);
    passport.unuse(SUCCESS_STRATEGY_NAME);
    passport.unuse(FAIL_STRATEGY_NAME);
  });

  describe.each`
    description                                      | options                                                      | endpoint                           | expectedStatus | expectedBody
    ${'clears request user by default'}              | ${{}}                                                        | ${'/pass-through'}                 | ${200}         | ${{ user: null }}
    ${'clears request user when disabled'}           | ${{ preserveExistingUserOnPass: false }}                     | ${'/pass-through'}                 | ${200}         | ${{ user: null }}
    ${'preserves request user when opted in'}        | ${{ preserveExistingUserOnPass: true }}                      | ${'/pass-through'}                 | ${200}         | ${{ user: { id: 'restored-from-strategy' } }}
    ${'preserves a configured request property'}     | ${{ preserveExistingUserOnPass: true, property: 'account' }} | ${'/pass-through-custom-property'} | ${200}         | ${{ account: { id: 'custom-property-user' } }}
    ${'assigns undefined returned by handleRequest'} | ${{ preserveExistingUserOnPass: true }}                      | ${'/return-undefined'}             | ${200}         | ${{ user: null }}
    ${'keeps normal success and failure behavior'}   | ${{ preserveExistingUserOnPass: true }}                      | ${'/success'}                      | ${200}         | ${{ user: { id: 'authenticated-user' } }}
    ${'keeps normal failure behavior'}               | ${{ preserveExistingUserOnPass: true }}                      | ${'/fail'}                         | ${401}         | ${{ message: 'Unauthorized', statusCode: 401 }}
  `('$description', ({ options, endpoint, expectedStatus, expectedBody }) => {
    let app: INestApplication;

    beforeAll(async () => {
      const modRef = await Test.createTestingModule({
        controllers: [DefaultPassThroughController],
        imports: [PassportModule.register(options)]
      }).compile();
      app = modRef.createNestApplication();
      await app.listen(0);
      const url = (await app.getUrl()).replace('[::1]', 'localhost');
      request.setBaseUrl(url);
    });

    it('should handle the request user', async () => {
      await spec()
        .get(endpoint)
        .expectStatus(expectedStatus)
        .expectBody(expectedBody);

      expect.assertions(0);
    });

    afterAll(async () => {
      await app.close();
    });
  });
});
