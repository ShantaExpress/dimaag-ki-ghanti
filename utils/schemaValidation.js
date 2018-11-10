import revalidator from 'revalidator'
import errors from 'feathers-errors'

module.exports = function jsonValidator (hook, schema) {
  let result = revalidator.validate(hook.data, schema)

  if (result.valid) return Promise.resolve(hook)

  let error = new Error(schema.message || 'Validation failed')

  error.errors = result.errors.map(error => {
    return {
      path: error.property,
      value: hook.data[error.property],
      message: `${error.property} ${error.message}`
    }
  })

  return Promise.reject(new errors.BadRequest(error, hook.data))
}