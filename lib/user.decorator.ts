import { createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator((data, req) => {
  if (req.user) {
    return req.user;
  } else {
    return null;
  }
});
