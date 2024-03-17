function divide(req, res, next) {
    const dividend = parseFloat(req.query.dividend);
    const divisor = parseFloat(req.query.divisor);

    if (isNaN(dividend) || isNaN(divisor) || divisor === 0) {
        const error = new Error('Invalid inputs');
        error.statusCode = 400;
        return next(error);
    }

    if (dividend % divisor !== 0) {
        const error = new Error('Result is not an integer');
        error.statusCode = 500;
        return next(error);
    }

    const result = dividend / divisor;
    res.json({ result });
}

module.exports = { divide };
