const express = require('express');
require('./db/mongoose.js')
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

//activating express
const app = express();
//Setting up port
const port = process.env.PORT || 3000;

//to convert incoming request into JSON format
app.use(express.json())
//registering router
app.use(userRouter);
app.use(taskRouter);


app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})