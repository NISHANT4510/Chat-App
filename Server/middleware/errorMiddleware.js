//Unsupported endpoints

const notFound = (req,res,next) =>{
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404)
    next(error);
}

//Error Middleware
const errorHandler = (error, req, res, next)=>{
    if(res.headerSent){
        return next(error);
    }
    res.status(error.code || 500).json({message: error.message || "An Unknown error occured."})
}

module.exports = {notFound,errorHandler}