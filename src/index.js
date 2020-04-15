const express = require('express');

require('./db/mongoose');

const UserRouter = require('./routers/UserRouter');
const TaskRouter = require('./routers/TaskRouter')

const app = express();

//we will be includeding environment varibales by using a npm module in order to make it do so in a cross os compatible way
const port = process.env.PORT;

/**
 * What to do when a file is getting too big?
 * -> Since index.js was getting too large we split it into smaller parts. All the routes has been put in separate files in order to avoid cluttering
 *    Now, the TaskROuter contains all the routes related to Task operations and the UserRouter contains all the routes for User ops
 
 * How to include the files?
 * -> const express = require('express');
      const router = express.Router();
 */


app.use(express.json())//this helps in parsing the incoming json-data and converts it into object

app.use(UserRouter);
app.use(TaskRouter);

app.listen(port, () => console.log('Server is up and running at port ' + port));