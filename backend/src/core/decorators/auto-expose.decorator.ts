import { Expose, Exclude } from 'class-transformer';

export function AutoExpose() {
  return <T extends { new (...args: never[]): object }>(target: T): void => {
    // Exclude all first
    Exclude()(target);

    // Expose every property declared in the class
    const instance = new target();
    const properties = Object.getOwnPropertyNames(instance);
    const prototype = target.prototype as object;

    for (const property of properties) {
      Expose()(prototype, property);
    }
  };
}
