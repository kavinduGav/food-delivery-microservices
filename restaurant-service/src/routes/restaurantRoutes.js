const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurantController");
const menuItemController = require("../controllers/menuItemController");

const {
  auth,
  isAdmin,
  isRestaurantOwner,
  isRestaurantOwnerOrAdmin,
} = require("../middleware/authGuard");

// Admin routes
router.get("/all", isAdmin, restaurantController.getAllRestaurants);
router.patch("/:id/verify", isAdmin, restaurantController.verifyRestaurant);
router.get(
  "/unverified",
  isAdmin,
  restaurantController.getUnverifiedRestaurants
);
router.put("/:id", isAdmin, restaurantController.adminUpdateRestaurant);
router.delete("/:id", isAdmin, restaurantController.adminDeleteRestaurant);

// Restaurant owner routes - automatically gets the owner's restaurant from JWT
router.get(
  "/my-restaurant",
  isRestaurantOwner,
  restaurantController.getMyRestaurant
);
router.post("/", auth, restaurantController.createRestaurant);
router.put(
  "/my-restaurant",
  isRestaurantOwner,
  restaurantController.updateMyRestaurant
);
router.patch(
  "/my-restaurant/availability",
  isRestaurantOwner,
  restaurantController.updateMyRestaurantAvailability
);

// Menu item routes for restaurant owner
router.get(
  "/my-menu-items",
  isRestaurantOwner,
  menuItemController.getMyMenuItems
);
router.post(
  "/menu-items",
  isRestaurantOwner,
  menuItemController.createMenuItem
);
router.put(
  "/my-menu-items/:id",
  isRestaurantOwner,
  menuItemController.updateMyMenuItem
);
router.delete(
  "/my-menu-items/:id",
  isRestaurantOwner,
  menuItemController.deleteMyMenuItem
);
router.patch(
  "/my-menu-items/:id/availability",
  isRestaurantOwner,
  menuItemController.updateMenuItemAvailability
);

// Public routes
router.get("/verified", restaurantController.getVerifiedRestaurants);
router.get("/:id", restaurantController.getRestaurantById);

// Routes for menu items (public)
router.get("/:restaurantId/menu-items", menuItemController.getMenuItems);

router.get("/menu-items/:id", menuItemController.getMenuItemById);
router.get("/test/test", auth, restaurantController.test);

module.exports = router;
