import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { spec, request } from 'pactum';
import { AppModule as WithRegisterModule } from '../with-register/app.module';
import { AppModule as WithoutRegisterModule } from '../without-register/app.module';

describe.each`
  AppModule                | RegisterUse
  ${WithRegisterModule}    | ${'with'}
  ${WithoutRegisterModule} | ${'without'}
`('Passport Module $RegisterUse register()', ({ AppModule }) => {
  let app: INestApplication;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    app = modRef.createNestApplication();
    await app.listen(0);
    const url = (await app.getUrl()).replace('[::1]', 'localhost');
    request.setBaseUrl(url);
  });

  describe('Authenticated flow', () => {
    it('should be able to log in and get a jwt, then hit the secret route', async () => {
      await spec()
        .post('/login')
        .withBody({ username: 'test1', password: 'test' })
        .expectStatus(201)
        .stores('token', 'token');
      await spec()
        .get('/private')
        .withHeaders('Authorization', 'Bearer $S{token}')
        .expectBody({ message: 'Hello secure world!' });
    });
  });

  describe('UnauthenticatedFlow', () => {
    it('should return a 401 for an invalid login', async () => {
      await spec()
        .post('/login')
        .withBody({ username: 'test1', password: 'not the right password' })
        .expectStatus(401);
    });
    it('should return a 401 for an invalid JWT', async () => {
      await spec()
        .get('/private')
        .withHeaders('Authorization', 'Bearer not-a-jwt')
        .expectStatus(401);
    });
  });

  describe('Custom strategy', () => {
    it('should be able to hit the custom route and get the user "state" attribute', async () => {
      await spec()
        .get('/custom-guard-with-state')
        .expectBody('custom-state-from-guard');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

describe('Passport Module with register() specific', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [WithRegisterModule]
    }).compile();
    app = modRef.createNestApplication();
    await app.listen(0);
    const url = (await app.getUrl()).replace('[::1]', 'localhost');
    request.setBaseUrl(url);
  });

  describe('Custom strategy', () => {
    it('should be able to hit the custom route and get the user "state" attribute', async () => {
      await spec()
        .get('/custom-guard')
        .expectBody('custom-state-from-register');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

describe('Passport Module without register() specific', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [WithoutRegisterModule]
    }).compile();
    app = modRef.createNestApplication();
    await app.listen(0);
    const url = (await app.getUrl()).replace('[::1]', 'localhost');
    request.setBaseUrl(url);
  });

  describe('Custom strategy', () => {
    it('should be able to hit the custom route and get the user "state" attribute as empty', async () => {
      await spec()
        .get('/custom-guard')
        .expectBody('');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
