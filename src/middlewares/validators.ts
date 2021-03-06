import Ajv from 'ajv';
import createError from 'http-errors';

export const validator = (schema: any, type: string) => async (
  ctx: any,
  next: any,
) => {
  try {
    //config schema input in ajv
    const ajv = new Ajv({
      removeAdditional: true,
      useDefaults: true,
      coerceTypes: true,
      allErrors: true,
      verbose: true,
      errorDataPath: 'properties',
    });

    //get condition request url for check validate
    const validate =
      type === 'params'
        ? ctx.params
        : type === 'query'
        ? ctx.query
        : ctx.request.body;

    //check validate by ajv
    const valid = ajv
      .addSchema(schema, 'bodySchema')
      .validate('bodySchema', validate);

    if (!valid) {
      throw createError(422, 'validation error', {
        errors: ajv.errors.map(err => ({
          code: 422,
          message: `${err.dataPath.slice(1)} ${err.message}`,
        })),
      });
    }

    await next();
  } catch (e) {
    ctx.throw(e);
  }
};
