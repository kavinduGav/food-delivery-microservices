// Enhanced restaurantController.js with owner-specific access controls

const Restaurant = require("../models/Restaurant");
const mongoose = require("mongoose");

// Get restaurant for the logged-in owner
exports.getMyRestaurant = async (req, res) => {
  try {
    // Find restaurant by owner ID from the JWT token
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        message: "You do not have a restaurant yet. Please create one first.",
      });
    }

    res.status(200).json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create restaurant for the logged-in owner
exports.createRestaurant = async (req, res) => {
  try {
    // Check if the owner already has a restaurant
    const existingRestaurant = await Restaurant.findOne({ owner: req.user.id });

    if (existingRestaurant) {
      return res.status(400).json({
        message:
          "You already have a restaurant. Please update your existing restaurant instead.",
      });
    }

    const { name, address, phone, cuisine, operatingHours } = req.body;

    // Create new restaurant with owner ID from JWT
    const restaurant = new Restaurant({
      name,
      owner: req.user.id, // From JWT token
      address,
      phone,
      cuisine,
      operatingHours,
      verified: false, // Admin will verify later
    });

    await restaurant.save();

    res.status(201).json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update the owner's restaurant
exports.updateMyRestaurant = async (req, res) => {
  try {
    const { name, address, phone, cuisine, operatingHours } = req.body;

    // Find restaurant by owner ID from JWT token
    let restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        message: "You do not have a restaurant yet. Please create one first.",
      });
    }

    // Update fields
    restaurant.name = name || restaurant.name;
    restaurant.address = address || restaurant.address;
    restaurant.phone = phone || restaurant.phone;
    restaurant.cuisine = cuisine || restaurant.cuisine;
    restaurant.operatingHours = operatingHours || restaurant.operatingHours;

    await restaurant.save();

    res.status(200).json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update restaurant availability
exports.updateMyRestaurantAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (isAvailable === undefined) {
      return res
        .status(400)
        .json({ message: "Availability status is required" });
    }

    // Find restaurant by owner ID from JWT token
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        message: "You do not have a restaurant yet. Please create one first.",
      });
    }

    restaurant.isAvailable = isAvailable;
    await restaurant.save();

    res.status(200).json({
      message: "Restaurant availability updated",
      restaurant,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
