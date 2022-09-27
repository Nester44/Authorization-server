const Router = require('express').Router
const userController = require('../controllers/user-controller')
const { body } = require('express-validator')
const authMiddleware = require('../middleware/auth-middleware')

const router = new Router()

router.post('/registration', body('email').isEmail(), userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/refresh', userController.refresh)
router.get('/users', authMiddleware, userController.getUsers)
router.post('/users/delete', authMiddleware, userController.deleteUser)
router.post('/users/block', authMiddleware, userController.blockUser)
router.post('/users/unblock', authMiddleware, userController.unblockUser)

module.exports = router
