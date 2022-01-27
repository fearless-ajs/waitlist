const AppError = require('./appError');
const filesystem = require('fs');
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    // const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    // console.log(value);

    const message = `Duplicate field value: ${err.keyValue.name}. Please use anther field value`;
    return new AppError(message, 400);
}

const handleValidationErrorDb = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data ${errors.join('. ')}`;
    return new AppError(message, 400);
}


const handleJWTError = () => new AppError('Invalid token! Please login again', 401);
const handleTokenExpiredError = () => new AppError('Your token has! Please login again', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        'status': err.status,
        'err': err,
        'message': err.message,
        'stack': err.stack
    });
}

const sendErrorProd = (err, res) => {
    //Operational, trusted error: send message to client
    if (err.isOperational){
        res.status(err.statusCode).json({
            'status': err.status,
            'message': err.message
        });

        //Programming or other unknown error: don't leak error details
    } else {
        // 1) Log error to the console
        console.error('Error!', err);

        // 2) Send a generic message
        res.status(500).json({
            'status': 'fail',
            'message': 'Something went very wrong!'
        });
    }

}

const checkUploadedFiles = async (req) => {

    if (req.originalUrl  === '/api/v1/businesses') {
           await filesystem.unlink(`public/uploads/images/businesses/${req.body.banner}`, function (err) {
                // return next(new AppError('Unable to delete File', 403));
                // if no error, file has been deleted successfully
                // console.log('File deleted!');
            });
    }

    if (req.originalUrl === '/api/v1/users/update-me'){
        await filesystem.unlink(`public/uploads/images/users/${req.body.image}`, function (err) {
            // return next(new AppError('Unable to delete File', 403));
            // if no error, file has been deleted successfully
            // console.log('File deleted!');
        });
    }

    if (req.originalUrl === '/api/v1/products'){
        await filesystem.unlink(`public/uploads/images/products/${req.body.frontView}`, (err) =>  {});
        await filesystem.unlink(`public/uploads/images/products/${req.body.backView}`, function (err) {});

        if (req.files.rightView){
            await filesystem.unlink(`public/uploads/images/products/${req.body.rightView}`, function (err) {
                // console.log('File deleted!');
            });
        }
        if (req.files.leftView){
            await filesystem.unlink(`public/uploads/images/products/${req.body.leftView}`, function (err) {
                // console.log('File deleted!');
            });
        }
    }

}

module.exports = async(err, req, res, next) => {
    // console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status     = err.status || 'error';

    if (req.file || req.files){
       await checkUploadedFiles(req);
    }

    if(process.env.NODE_ENV === 'development'){
        //Full error message in development environment
        sendErrorDev(err, res);
    }else if(process.env.NODE_ENV === 'production'){
        let error = { ...err };
        if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error._message === 'Validation failed') error = handleValidationErrorDb(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();



        //Minimal error message in production environment
        sendErrorProd(error, res);
    }

}