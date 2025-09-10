// Middleware to verify the JWT token
AuthMiddlewares.checkAuth = async (req, res, next) => {
    const token = req.headers.x_access_token || req.cookies[cookieAttributeForJwtToken];
    if (token) {
      try {
        const decodedToken = verifyJwtToken(token); // Your custom verifyJwtToken function
        res.locals.user = {
          user_id: decodedToken.data.user_id,
          username: decodedToken.data.user_name,
        };
        next();
      } catch (error) {
        return next(
          new AppError("You are not authorized", STATUS_CODES.UNAUTHORIZED)
        );
      }
    } else {
      return next(
        new AppError("You are not authorized", STATUS_CODES.UNAUTHORIZED)
      );
    }
  };
  