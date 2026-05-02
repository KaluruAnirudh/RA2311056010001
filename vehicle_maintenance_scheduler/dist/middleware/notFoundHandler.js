export function notFoundHandler(request, response) {
    response.status(404).json({
        message: `Route ${request.method} ${request.originalUrl} was not found`
    });
}
