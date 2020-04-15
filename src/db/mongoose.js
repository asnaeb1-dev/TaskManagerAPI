const mongoose = require('mongoose');

mongoose.connect(process.env.CONN_URL, {
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useCreateIndex : true,
    useFindAndModify: true
});
 
/**
 * when deploying the database what we need is somewhere to host our databse. How to do that? There are multiple companies that allow databse hosting but 
 * mongodb has it own which is called ATLAS
 * 
 * terminologY:
 * 1) mongodb cluster: a group of servers which help you have a low latency server round the globe
 */