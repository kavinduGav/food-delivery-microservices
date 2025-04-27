// src/controllers/restaurantController.js
const { log } = require("node:console");
const Restaurant = require("../models/Restaurant");
const mongoose = require("mongoose");

const axios = require('axios');


// Get all restaurants (admin only)
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json(restaurants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify a restaurant (admin only)
exports.verifyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    
    try {
      
      await axios.put(`http://localhost:3000/api/auth/${restaurant.owner}/role`, {
        role: "restaurant_admin"
      }, {
        headers: {
          
          Authorization: req.headers.authorization
        }
      });
    } catch (authError) {
      console.error("Error updating user role:", authError);
      return res.status(500).json({ message: "Failed to update user role" });
    }

    restaurant.verified = true;
    await restaurant.save();

    res.status(200).json({ 
      message: "Restaurant verified successfully", 
      restaurant 
    });
  } catch (err) {
    console.error(err);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Restaurant not found" });
    }
   
    res.status(500).json({ message: "Server error" });
  }
};

// Get all unverified restaurants (admin only)
exports.getUnverifiedRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ verified: false });
    res.status(200).json(restaurants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin update restaurant details
exports.adminUpdateRestaurant = async (req, res) => {
  try {
    const { name, address, phone, cuisine, operatingHours, verified } =
      req.body;

    // Find restaurant
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Update fields
    restaurant.name = name || restaurant.name;
    restaurant.address = address || restaurant.address;
    restaurant.phone = phone || restaurant.phone;
    restaurant.cuisine = cuisine || restaurant.cuisine;
    restaurant.operatingHours = operatingHours || restaurant.operatingHours;
    restaurant.verified =
      verified !== undefined ? verified : restaurant.verified;

    await restaurant.save();

    res.status(200).json(restaurant);
  } catch (err) {
    console.error(err);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

// Admin delete restaurant
exports.adminDeleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    await Restaurant.deleteOne({ _id: restaurant._id });

    res.status(200).json({ message: "Restaurant removed" });
  } catch (err) {
    console.error(err);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

// RESTAURANT OWNER SPECIFIC LOGIC
// ===============================

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

    const { name, address, phone  } = req.body;

    // Create new restaurant with owner ID from JWT
    const restaurant = new Restaurant({
      name,
      owner: req.user.id, // From JWT token
      address,
      phone,
     
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

// SHARED/PUBLIC ENDPOINTS
// =======================

// Get restaurant by ID (public or authenticated)
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json(restaurant);
  } catch (err) {
    console.error(err);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

// Get all verified restaurants (public)
exports.getVerifiedRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      verified: true,
      isAvailable: true,
    });

    res.status(200).json(restaurants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.test = async (req, res) => {
  const loggedInUser = req.user;
  console.log(loggedInUser);
  res.status(200).json({ message: "restaurant test done" });
};
