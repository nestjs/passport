export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

export type WithoutCallback<T extends any[]> =
  // T extends any makes this distributive
  T extends any
    ? T extends [...infer U, infer C]
      ? C extends Function
        ? U
        : T
      : T
    : never;
