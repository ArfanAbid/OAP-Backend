
export const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.userRole === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admins only." });
    }
};
