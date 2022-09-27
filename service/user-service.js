const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')
const userModel = require('../models/user-model')

class UserService {
  async registration(email, password, name) {
    const candidate = await UserModel.findOne({ email })
    if (candidate) {
      throw ApiError.BadRequest(`User with email ${email} already exists`)
    }
    const hashedPassword = await bcrypt.hash(password, 3)
    const currentTime = new Date().toUTCString()
    const user = await UserModel.create({ email, password: hashedPassword, name, registrationTime: currentTime, lastLoginTime: currentTime })

    const userDto = new UserDto(user) // email id regTime lastLogTime status
    const tokens = tokenService.generateTokens({ ...userDto })
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return { ...tokens, user: userDto }
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email })
    if (!user) {
      throw ApiError.BadRequest('User with this email doesn\'t exist')
    }
    if (user.status === 'blocked') {
      throw ApiError.BadRequest('User blocked')
    }
    const isPassEquals = await bcrypt.compare(password, user.password)
    if (!isPassEquals) {
      throw ApiError.BadRequest('Wrong password')
    }
    const currentTime = new Date().toUTCString()
    user.lastLoginTime = currentTime
    user.save()

    const userDto = new UserDto(user)
    userDto.lastLoginTime = currentTime
    const tokens = tokenService.generateTokens({ ...userDto })

    await tokenService.saveToken(userDto.id, tokens.refreshToken)
    return { ...tokens, user: userDto }
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken)
    return token
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnathorizedError()
    }
    const userData = tokenService.validateRefreshToken(refreshToken)
    const tokenFromDb = await tokenService.findToken(refreshToken)
    if (!userData || !tokenFromDb) {
      throw ApiError.UnathorizedError()
    }
    const user = await UserModel.findById(userData.id)
    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({ ...userDto })

    await tokenService.saveToken(userDto.id, tokens.refreshToken)
    return { ...tokens, user: userDto }
  }

  async getAllUsers() {
    const users = await UserModel.find()
    return users
  }

  async deleteUser(delId) {
    const userData = await UserModel.findByIdAndDelete(delId)
    return userData
  }

  async block(userId) {
    const userData = await UserModel.findById(userId)
    if (!userData) {
      throw ApiError.BadRequest('Wrong id')
    }
    await tokenService.removeTokenByUserId(userId)
    userData.status = 'blocked'
    return userData.save()
  }

  async unblock(userId) {
    const userData = await UserModel.findById(userId)
    if (!userData) {
      throw ApiError.BadRequest('Wrong id')
    }
    userData.status = 'active'
    return userData.save()
  }

  async getUserById(userId) {
    const userData = userModel.findById(userId)
    return userData;
  }
}

module.exports = new UserService()