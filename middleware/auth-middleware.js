const ApiError = require('../exceptions/api-error')
const tokenService = require('../service/token-service')
const userService = require('../service/user-service')

module.exports = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization
    if (!authorizationHeader) {
      return next(ApiError.UnathorizedError())
    }

    const accessToken = authorizationHeader.split(' ')[1]

    if (!accessToken) {
      return next(ApiError.UnathorizedError())
    }

    const userData = await tokenService.validateAccessToken(accessToken)
    if (!userData) {
      return next(ApiError.UnathorizedError())
    }

    const dbUserData = await userService.getUserById(userData.id)

    if (!dbUserData) {
      return next(ApiError.UnathorizedError())
    }
    if (dbUserData.status === 'blocked') {
      return next(ApiError.BadRequest('User blocked'))
    }

    req.user = userData;
    next()

  } catch (err) {
    return next(ApiError.UnathorizedError())
  }
}