module.exports = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: err.errorCode || 'INTERNAL_ERROR',
    message: err.message || 'Something went wrong'
  });
};