export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  let status = res.statusCode === 200 ? 500 : res.statusCode;
  let message = error.message || "Unexpected server error";

  if (error.name === "ValidationError") {
    status = 400;
    message = Object.values(error.errors)
      .map((entry) => entry.message)
      .join(", ");
  }
  if (error.code === 11000) {
    status = 409;
    message = "An account with this email already exists";
  }
  if (error.name === "CastError") {
    status = 404;
    message = "The requested record was not found";
  }
  if (error.code === "LIMIT_FILE_SIZE") {
    status = 400;
    message = "Image must be smaller than 5 MB";
  }

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack })
  });
}

