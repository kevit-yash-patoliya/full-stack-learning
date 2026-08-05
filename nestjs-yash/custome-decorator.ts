// is-even.decorator.ts
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsEven(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEven',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'number' && value % 2 === 0;
        },
        defaultMessage(args: ValidationArguments) {
          return `The property ${args.property} must be an even number!`;
        },
      },
    });
  };
}