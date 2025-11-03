import { Expose, Exclude } from 'class-transformer';

export function AutoExpose(): ClassDecorator {
  return (target: any) => {
    // Exclude all first
    Exclude()(target);

    // Expose every property declared in the class
    const properties = Object.getOwnPropertyNames(new target());
    for (const property of properties) {
      Expose()(target.prototype, property);
    }
  };
}
