export type Value<T> = T extends { new (...args: any[]): infer U } ? U : any;
