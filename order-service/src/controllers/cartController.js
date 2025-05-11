const Cart = require('../models/Cart');
const axios = require('axios');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
                            
    
    if (!cart) {
      return res.status(200).json({ cart: null });
    }
    
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;
    
    if (!menuItemId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    console.log(menuItemId);
    console.log(quantity);
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
    
    if (!menuItem.isAvailable) {
      return res.status(400).json({ message: 'This item is currently unavailable' });
    }
    
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (cart) {
      if (cart.restaurant.toString() !== menuItem.restaurant.toString()) {
        await Cart.deleteOne({ _id: cart._id });
        cart = null;
      }
    }
    
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        restaurant: menuItem.restaurant,
        items: [],
        totalAmount: 0
      });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.menuItem.toString() === menuItemId
    );
    
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        menuItem: menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity
      });
    }
    
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

exports.updateCartItem = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;
    
    if (!menuItemId || !quantity) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.menuItem.toString() === menuItemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });  
    }
    
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
    
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    );
    
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

exports.removeFromCart = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.menuItem.toString() === menuItemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });  
    }
    
    cart.items.splice(itemIndex, 1);
    
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    );
    
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