export const errorHandler = (error, _request, response, _next) => {
  console.error(error)

  if (response.headersSent) {
    return
  }

  response.status(500).json({
    message: 'Internal server error.',
  })
}
