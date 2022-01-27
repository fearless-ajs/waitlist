const mongoose = require('mongoose');
const dotenv = require('dotenv');

class Server {
    constructor() {

        // For Tracking unhandled Exceptions
        process.on('uncaughtException', err => {
            console.log('UNCAUGHT EXCEPTION! Shutting Down...');
            console.log(err.name, err.message);
            process.exit(1);   //Exit application
        });

        // Initializing the env config file
        dotenv.config({path: './config.env'});
        this.port = process.env.PORT || 5000;

        this.app = require('./app');
        this.startApp().then(r => console.log("Initiating Server Setup..."));
    }

    startApp = async () => {
        try{
            await this.connectDatabase();
        }catch (err) {
            console.log(`Something fatal went wrong with the server: ${err}`);
        }
    }

    connectDatabase = async () => {
        //DB connection string
        const DB = await process.env.DATABASE.replace(
            '<PASSWORD>',
            process.env.DATABASE_PASSWORD
        );
        mongoose.connect(DB, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log('Database connection successful');
            //START SERVER
            this.startServer();
        }).catch(err => {
            console.log('Database connection failed');
            return false
        });
    }

    startServer = () => {
        const server = this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });

        process.on('unhandledRejection', err => {
            console.log('UNHANDLED REJECTION! Shutting Down...');
            console.log(err.name, err.message);
            server.close(() => {
                process.exit(1); //Exit application
            });
        });
    }
}
new Server();

