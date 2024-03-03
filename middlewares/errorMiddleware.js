function errorMiddleware(err, req, res, next) {
    // Default status code if not provided
    const statusCode = err.statusCode || 500;
    // Render error page using EJS
    console.log(err.message)
    res.status(statusCode).render('error', {
        message: err.message,
        
        statusCode: statusCode
    });
}

module.exports = errorMiddleware;
