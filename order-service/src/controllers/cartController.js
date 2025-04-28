const Cart = require('../models/Cart');
const axios = require('axios');

// Get the current user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
                            .populate('restaurant', 'name');
    
    if (!cart) {
      return res.status(200).json({ cart: null });
    }
    
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;
    
    // Validate request
    if (!menuItemId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    console.log(menuItemId);
    console.log(quantity);
    // Get menu item details
    let menuItem;
    try {
      const response = await axios.get(`http://localhost:5001/api/restaurants/menu-items/${menuItemId}`, {
        headers: {
          Authorization: req.headers.authorization
        }
      });
      menuItem = response.data; // Extract the data from the axios response
    } catch (err) {
      console.error(err.message);
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Check if menu item is available
    if (!menuItem.isAvailable) {
      return res.status(400).json({ message: 'This item is currently unavailable' });
    }
    
    // Find user's existing cart
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (cart) {
      // If cart exists but is for a different restaurant, clear it
      if (cart.restaurant.toString() !== menuItem.restaurant.toString()) {
        await Cart.deleteOne({ _id: cart._id });
        cart = null;
      }
    }
    
    // If no cart exists or was cleared, create new one
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        restaurant: menuItem.restaurant,
        items: [],
        totalAmount: 0
      });
    }
    
    // Check if item already in cart
    const itemIndex = cart.items.findIndex(
      item => item.menuItem.toString() === menuItemId
    );
    
    if (itemIndex > -1) {
      // Update existing item quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        menuItem: menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity
      });
    }
    
    // Calculate total amount
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    );
    
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;
    
    // Validate request
    if (!menuItemId || !quantity) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item.menuItem.toString() === menuItemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });  
    }
    
    if (quantity <= 0) {
      // Remove item from cart if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }
    
    // Calculate total amount
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    );
    
    // If cart is empty, remove it
    if (cart.items.length === 0) {
      await Cart.deleteOne({ _id: cart._id });
      return res.status(200).json({ message: 'Cart is now empty' });
    }
    
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item.menuItem.toString() === menuItemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });  
    }
    
    // Remove item from cart
    cart.items.splice(itemIndex, 1);
    
    // Calculate total amount
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    );
    
    // If cart is empty, remove it
    if (cart.items.length === 0) {
      await Cart.deleteOne({ _id: cart._id });
      return res.status(200).json({ message: 'Cart is now empty' });
    }
    
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const result = await Cart.deleteOne({ user: req.user.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};