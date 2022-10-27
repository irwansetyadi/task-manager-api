const express = require('express');
require('./db/mongoose.js');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

//activating express
const app = express();
//Setting up port
const port = process.env.PORT || 3000;

//to convert incoming request into JSON format
app.use(express.json());
//registering router
app.use(userRouter);
app.use(taskRouter);


app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
})




// const Task = require('./models/task');
// const User = require('./models/user');

// const main = async () => {
//     // const task = await Task.findOne({_id:'6358042ce4c0960429fdd30f'}).populate('author').exec(function(err, task){
//     //     console.log(task.author.name);
//     // })

//     // // console.log(task.author);
//     const user = await User.findById('6358041de4c0960429fdd30a').populate('tasks').exec((err, user) =>{
//         if(err) console.error(err);

//         console.log(user.tasks)
//     });
// }

// main()