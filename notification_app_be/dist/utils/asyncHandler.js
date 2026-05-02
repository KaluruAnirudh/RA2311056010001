export function asyncHandler(handler) {
    return function wrappedHandler(request, response, next) {
        handler(request, response, next).catch(next);
    };
}
