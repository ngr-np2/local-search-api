const routes = require("express").Router();
const advertiseRoutes = require("./src/advertise/advertise.routes");
const authRoutes = require("./src/auth/auth.routes");
const businessProfileRoutes = require("./src/businessProfile/businessProfile.routes");
const categoryRoutes = require("./src/category/category.routes");
const docCountRoutes = require("./src/count/docCount.routes");
const keywordRoutes = require("./src/keyword/keyword.route");
const reviewsRoutes = require("./src/review/review.routes");
const userRoutes = require("./src/users/user.routes");
const RefreshToken = require("./src/helper/refreshToken")
routes.get("/refreshToken", RefreshToken)
routes.use("/auth", authRoutes);
routes.use("/users", userRoutes);
routes.use("/review", reviewsRoutes);
routes.use("/business", businessProfileRoutes);
routes.use("/ads", advertiseRoutes);
routes.use("/catg", categoryRoutes);
routes.use("/keyword", keywordRoutes);
routes.use("/count", docCountRoutes);
module.exports = routes;
