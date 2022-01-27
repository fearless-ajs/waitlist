const mongoose = require('mongoose');
const validator = require('validator');

waitListSchema = new mongoose.Schema({
        fullname: {
            type: String,
            required: [true, 'Name field is required'],
            trim: true,
            maxlength: [200, 'Name should not be more than 200 characters'],
            minlength: [2, 'Name should not be less than 2 characters']
        },
        waitListerType: {
            type: String,
            required: [true, 'waitListerType field is required'],
            enum: {
                values: ['Investors', 'Asset-listers'],
                message: 'WaitLister can either be Investors or Asset-listers'
            }
        },
        description: {
            type: String,
            required: false,
            maxlength: [2000, 'description should not be more than 2000 characters'],
            minlength: [2, 'description should not be less than 2 characters']
        },
        email: {
            type: String,
            unique: [true, 'Email has been taken'],
            required: [true, 'Email field is required'],
            trim: true,
            validate: [validator.isEmail, 'Please provide a valid email']
        },
});

module.exports = mongoose.model('WaitList', waitListSchema);