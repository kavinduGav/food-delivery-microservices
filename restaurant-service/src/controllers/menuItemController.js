// Enhanced menuItemController.js with owner-specific access controls

const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

// Get menu items for the restaurant owner's restaurant
exports.getMyMenuItems = async (req, res) => {
  try {
    // First find the owner's restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        message: "You do not have a restaurant yet. Please create one first.",
      });
    }

    // Then get menu items for that restaurant
    const menuItems = await MenuItem.find({ restaurant: restaurant._id });

    res.status(200).json(menuItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create menu item for the restaurant owner's restaurant
exports.createMyMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      preparationTime,
      specialDiets,
      spicyLevel,
    } = req.body;

    // First find the owner's restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        message: "You do not have a restaurant yet. Please create one first.",
      });
    }

    // Create new menu item using the restaurant ID
    const menuItem = new MenuItem({
      name,
      description,
      price,
      category,
      restaurant: restaurant._id, // Use restaurant ID from query
      image,
      preparationTime,
      specialDiets,
      spicyLevel,
    });

    await menuItem.save();

    res.status(201).json(menuItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update menu item for owner's restaurant
exports.updateMyMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      isAvailable,
      preparationTime,
      specialDiets,
      spicyLevel,
    } = req.body;

    // Find the owner's restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        message: "You do not have a restaurant yet.",
      });
    }

    // Find menu item and verify it belongs to the owner's restaurant
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      restaurant: restaurant._id,
    });

    if (!menuItem) {
      return res.status(404).json({
        message: "Menu item not found or does not belong to your restaurant",
      });
    }

    // Update fields
    menuItem.name = name || menuItem.name;
    menuItem.description = description || menuItem.description;
    menuItem.price = price || menuItem.price;
    menuItem.category = category || menuItem.category;
    menuItem.image = image || menuItem.image;
    menuItem.isAvailable =
      isAvailable !== undefined ? isAvailable : menuItem.isAvailable;
    menuItem.preparationTime = preparationTime || menuItem.preparationTime;
    menuItem.specialDiets = specialDiets || menuItem.specialDiets;
    menuItem.spicyLevel =
      spicyLevel !== undefined ? spicyLevel : menuItem.spicyLevel;

    await menuItem.save();

    res.status(200).json(menuItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete menu item for owner's restaurant
exports.deleteMyMenuItem = async (req, res) => {
  try {
    // Find the owner's restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        message: "You do not have a restaurant yet.",
      });
    }

    // Find menu item and verify it belongs to the owner's restaurant
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      restaurant: restaurant._id,
    });

    if (!menuItem) {
      return res.status(404).json({
        message: "Menu item not found or does not belong to your restaurant",
      });
    }

    await MenuItem.deleteOne({ _id: menuItem._id });

    res.status(200).json({ message: "Menu item removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


