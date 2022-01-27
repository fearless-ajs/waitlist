const catchAsync = require('./../../Exceptions/catchAsync');
const AppError = require('./../../Exceptions/appError');
const WaitList = require('../../Models/WaitList');

class WaitListController {

    joinWaitList = catchAsync(async (req, res, next) => {

        // 1. the asset lister must provide a description
        if(req.body.waitListerType === "Asset-listers" && !req.body.description){
            return next(new AppError('Asset lister must provide a description of the asset they plan on listing', 401))
        }

        //2. Delete Description field for Investors, it is not required
        if(req.body.waitListerType === "Investors" && req.body.description){
           delete req.body.description;
        }

        const waitLister = await WaitList.create({
            fullname: req.body.fullname,
            email: req.body.email,
            description: req.body.description,
            waitListerType: req.body.waitListerType,
        });

        return res.status(200).json({
            status: 'success',
            waitLister: {
                ...waitLister._doc
            },
        });

    });


}


module.exports = new WaitListController;