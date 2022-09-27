const userService = require('../service/user-service')
const { validationResult } = require('express-validator')
const ApiError = require('../exceptions/api-error')

class UserController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Validation error', errors.array())
      }
      const { email, password, name } = req.body
      const userData = await userService.registration(email, password, name)
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const userData = await userService.login(email, password)
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken)
      res.clearCookie('refreshToken')
      return res.json(token)
    } catch (e) {
      next(e)
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const userData = await userService.refresh(refreshToken)
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
      return res.json(userData)

    } catch (e) {
      next(e)
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers()
      return res.json(users)
    } catch (e) {
      next(e)
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { userId, delId } = req.body

      if (userId === delId) { res.clearCookie('refreshToken') }

      const userData = await userService.deleteUser(delId)
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async blockUser(req, res, next) {
    try {
      const { userId, blockId } = req.body
      const userData = await userService.block(blockId)
      if (userId === blockId) { res.clearCookie('refreshToken') }
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async unblockUser(req, res, next) {
    try {
      const { unblockId } = req.body
      const userData = await userService.unblock(unblockId)
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }


}

module.exports = new UserController()