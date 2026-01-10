export const adminRole = (req, res, next) => {
    if (req.user.role === "admin") {
        next();
    } else {
        res.status(401).json({ message: "Unauthorized only for admin" });
    }
};

export const managerRole = (req, res, next) => {
    if (req.user.role === "manager") {
        next();
    } else {
        res.status(401).json({ message: "Unauthorized only for manager" });
    }
};