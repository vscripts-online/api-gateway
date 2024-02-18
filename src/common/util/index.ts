import { Class, ISearch } from '../type';
export * from './shared_classes';

/** It searches for the given key in the process.env variable.
 * If it cannot find it, it gives an error.  */
export const getEnvOrThrow = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw Error(`${key} not found in .env`);
  }

  return value;
};

/** Returns a random integer value between min and max arguments.
 * Min and max are included  */
export function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Default skip and limit value to be used when retrieving data from the database */
export const DEFAULT_SEARCH: ISearch = { skip: 0, limit: 20 };

/** Creates serializable object using example data and properytname in the
 *  @ApiProperty decorator of the given class Note: Since the function creates
 * a new class instance, it does not send parameters to the class constructor,
 * so it is recommended to use a class without dependencies.
 * See readme for example  */
export function classToSwaggerJson(_class: Class) {
  const instance = new _class();
  const methods = Reflect.getMetadata(
    'swagger/apiModelPropertiesArray',
    instance,
  );

  const keys = {};

  for (const method of methods) {
    const key = method[0] === ':' ? method.slice(1) : method;
    const { example } = Reflect.getMetadata(
      'swagger/apiModelProperties',
      instance,
      key,
    );
    keys[key] = example;
  }

  return keys;
}
