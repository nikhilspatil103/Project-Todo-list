const express = require('express');

const router = express.Router();

const middleware=require('../middleware/auth')
const userController=require('../controller/userController')
const boardController=require('../controller/boardController')
const todoController=require('../controller/todoController')


//SignUp API
router.post('/SignUp',userController.SignUp)
// login API
router.post('/login', userController.login)

//enter otp
router.post('/enterOtp', userController.enterOtp)



// create board API
router.post('/board/:userId',middleware.userAuth,boardController.createBoard)
// get by Id
router.get('/board/:boardId',middleware.userAuth,boardController.getboardById)
//update Board
router.put('/board/:boardId',middleware.userAuth,boardController.updateBoard)
// delete board
router.delete('/board/:boardId',middleware.userAuth, boardController.deleteBoardById)

//create task
router.post('/board/:boardId/task',middleware.userAuth,todoController.createtask)
//get task by id
router.get('/board/:boardId/task/:taskId',middleware.userAuth,todoController.getTaskById)
//update task
router.put('/board/:boardId/task/:taskId',middleware.userAuth,todoController.updatetask)
//delete task
router.delete('/board/:boardId/task/:taskId',middleware.userAuth,todoController.deleteTaskById)

module.exports = router