const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Create new order from cart
exports.createOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod } = req.body;
    
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Create new order
    const order = new Order({
      user: req.user.id,
      restaurant: cart.restaurant,
      items: cart.items,
      totalAmount: cart.totalAmount,
      deliveryAddress,
      paymentMethod,
      status: 'pending'
    });
    
    // Save order
    await order.save();
    
    // Clear the cart
    await Cart.deleteOne({ _id: cart._id });
    
    res.status(201).json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all orders for the current user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
                              .populate('restaurant', 'name')
                              .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get a specific order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
                             
    
    // Check if order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this order' });
    }
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }
    
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled at this stage' 
      });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
};

exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
                             .select('status createdAt updatedAt');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to track this order' });
    }
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (req.user.role !== 'restaurant_admin' || order.restaurant.toString() !== req.user.restaurant) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    
    order.status = req.body.status;
    await order.save();
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
}

exports.getOrdersByRestaurant = async (req, res) => {
  try {
    const orders = await Order.find({ restaurant: req.user.restaurant })
                              .populate('user', 'name email')
                              .sort({ createdAt: -1 });

    if (req.user.role !== 'restaurant_admin') {
      return res.status(403).json({ message: 'Not authorized to view these orders' });
    }
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}