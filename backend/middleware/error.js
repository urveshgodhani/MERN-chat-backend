function error(err, req, res, next) {
  console.log("error");
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message,
  });
}

module.exports = error;
