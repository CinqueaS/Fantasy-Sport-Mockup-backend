const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
    // .split() removes the word "Bearer" from the token response, as well as the space between.
    // This is because the response is technically an array originally
    try {
        
        const token = req.headers.authorization.split(' ')[1] // Fixes array technicality
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Sets the user to the decoded variable (???)
        // Assign decoded payload to req.user
        // give user object for any route that requires it (????)
        req.user = decoded;
        // Call next() to invoke the next middleware function
        next()

    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
}

// Export for use in controllers file(s)
module.exports = verifyToken