const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const boardModel = require('../models/boardModel')
const validator = require('../utils/validator')
const todoModel = require('../models/todoModel')


const createBoard = async function (req, res) {
    try {
        let requestBody = req.body

        let userId = req.params.userId


        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide Detaills" })
        }

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." })
        }

        if (!validator.isValid(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid user id or not present ` })

        }
        let user = await userModel.findOne({ _id: userId })

        if (!user) {
            return res.status(400).send({ status: false, message: `User doesn't exists by ${userId}` })
        }
        //Extract body
        let { boardName } = requestBody

        if (!validator.isValid(boardName)) {
            return res.status(400).send({ status: false, message: `please right board Name ` })

        }
        let isBoardNamePresent = await boardModel.findOne({ boardName: boardName })

        if (isBoardNamePresent) {
            return res.status(400).send({ status: false, message: `${boardName} Alredy present` })
        }

        let boardData = { boardName, userId }

        let board = await boardModel.create(boardData)

        res.status(201).send({ status: true, data: board })
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }

}

const getboardById = async function (req, res) {
    try {
        let boardId = req.params.boardId


        if (!validator.isValidObjectId(boardId)) {
            return res.status(400).send({ status: false, message: "Invalid boardId in params." })
        }

        if (!validator.isValid(boardId)) {
            return res.status(400).send({ status: false, message: `${boardId} is not a valid user id or not present ` })

        }

        let boardData = await boardModel.findOne({ _id: boardId , isDeleted: false })

        if (!boardData) {
            return res.status(400).send({ status: false, message: `${boardId} is not present` })
        }

        let todoList = await todoModel.find({ isDeleted: false })

        let task = []
        for (i in todoList) {
            if (todoList[i].boardId.toString() === boardId) {
                task.push(todoList[i])
            }
        }

        let board = boardData.toObject()
        board['task'] = task

        res.status(200).send({ status: true, data: board })
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }


}

const updateBoard = async function (req, res) {
    try {
        let userIdFromToken = req.userId;
        let boardId = req.params.boardId;
        let requestBody = req.body;

        if (!validator.isValidObjectId(boardId)) {
            return res.status(400).send({ status: false, message: "Invalid boardId in params." })
        }

      

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid requestBody." })
        }

        const findBoard = await boardModel.findOne({ _id: boardId, isDeleted: false })

        if (!findBoard) {
            return res.status(400).send({ status: false, message: `${boardId} is not present` })
        }

        //Authorization
        if (findBoard.userId.toString() != userIdFromToken) {
            return res.status(400).send({ status: false, message: `Unauthorized access! Owner info doesn't match` })
        }

        //Extract body
        const { boardName } = requestBody;

        if (!validator.isValid(boardName)) {
            return res.status(400).send({ status: false, message: `Invalid board name.` })
        }

        const updateBoardName = await boardModel.findOneAndUpdate({ _id: boardId }, { boardName: boardName }, { new: true })

       
        return res.status(200).json({ status: true, message: `Board name updated successfully.`, data: updateBoardName })
    
    } catch (err) {
        return res.status(500).send({ Error: err.message })
    }
}

const deleteBoardById = async function (req, res) {
    try {
        let boardId = req.params.boardId
        let userIdFromToken = req.userId


        if (!validator.isValidObjectId(boardId)) {
            return res.status(400).send({ status: false, message: "Invalid boardId in params." })
        }

     

        let boardData = await boardModel.findOne({ _id: boardId, isDeleted: false })

        if (!boardData) {
            return res.status(400).send({ status: false, message: `${boardId} is not present` })
        }

        if (boardData.userId.toString() != userIdFromToken) {
            return res.status(400).send({ status: false, message: `Unauthorized access! Owner info doesn't match` })
        }

        let data = await boardModel.findOneAndUpdate({ _id: boardId }, { isDeleted: true }, { new: true })
        await todoModel.updateMany({ _id: boardId }, { isDeleted: true })

        res.status(204).send({ status: true, message: "Board deleted", data: data })
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }


}
module.exports = {
    createBoard, deleteBoardById, getboardById,updateBoard
}