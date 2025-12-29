export const responseHandler = (req, res, next) => {
    res.sendResponse = (statusCode, data, message) => {
        res.status(statusCode).json({ success: true, data, message });
    };
    next();
};
