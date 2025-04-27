
const jwt = require("jsonwebtoken");


const auth = (req, res, next) => {

  const token = req.header("Authorization")?.split(" ")[1];


  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Customer role guard
const isCustomer = (req, res, next) => {
  auth(req, res, () => {
    if (req.user && req.user.role === "customer") {
      next();
    } else {
      res
        .status(403)
        .json({
          message: "Access denied. Only customers can place orders",
        });
    }
  });
}

const isRestaurantAdmin = (req, res, next) => {
    auth(req, res, () => {
        if (req.user && req.user.role === "restaurant_admin") {
        next();
        } else {
        res
            .status(403)
            .json({
            message: "Access denied. Only restaurant admins can confirm orders",
            });
        }
    });
    }





module.exports = {
  auth,
  isCustomer,
 isRestaurantAdmin,
}
  