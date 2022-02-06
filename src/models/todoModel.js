const mongoose=require('mongoose')

const todoSchema= new mongoose.Schema({
    boardId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'board',
        required:true
    },
    task:{
        type:String,
        required:true,
        unique:true
    },
    status:{
        type: String,
        default: 'Todo',
        required: true
    },
    isDeleted:{
        type:Boolean,
        default:false  
    }
  
},{timestamps:true})

module.exports=mongoose.model('Todo',todoSchema)