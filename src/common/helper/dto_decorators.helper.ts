import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';

/** Checks if it is equal to another property in dto */
export function IsNotEqualWith(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotEqualWith',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return (
            typeof value === 'string' &&
            typeof relatedValue === 'string' &&
            value !== relatedValue
          );
        },
      },
    });
  };
}
