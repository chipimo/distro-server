const express = require('express')
const loaders = require('./loaders/index');
const config = require('./config/config');

require('dotenv').config();

async function startServer(port, db_url) {
    const app = express();
    const loaded = await loaders.init({ expressApp: app, dbUrl: db_url });
    if (loaded)
        app.listen(port, () => console.log(`Express App is listening on : ${port}`));
    else
        console.log("[-] ERROR: failed connecting to MongoDB ... Exiting");
}
 
startServer(process.env.PORT || 4000, 'mongodb+srv://kmp:kmpcoding123@cluster0.o11q1.mongodb.net/kmp?retryWrites=true&w=majority');
  