const Product = require('../models/product')
const Order = require('../models/order')

exports.getProducts = (req, res, next) => {
  Product.find().then(products => {
    res.render('shop/product-list', {
      pageTitle: 'All Products',
      path: '/products',
      prods: products,
    })
  })
}

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId
  Product.findById(prodId).then(product => {
    res.render('shop/product-detail', {
      pageTitle: product.title,
      path: '/products',
      product,
    })
  })
}

exports.getIndex = (req, res, next) => {
  Product.find().then(products => {
    res.render('shop/index', {
      pageTitle: 'Shop',
      path: '/',
      prods: products,
    })
  })
}

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items
      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products,
      })
    })
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId
  Product.findById(prodId)
    .then(product => req.user.addToCart(product))
    .then(() => res.redirect('/cart'))
}

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId

  req.user.removeFromCart(productId).then(() => res.redirect('/cart'))
}

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(product => ({
        product: { ...product.productId._doc },
        quantity: product.quantity,
      }))

      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },

        products,
      })

      return order.save()
    })
    .then(() => req.user.clearCart())
    .then(() => res.redirect('/orders'))
}

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id }).then(orders =>
    res.render('shop/orders', {
      pageTitle: 'Your Orders',
      path: '/orders',
      orders,
    })
  )
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout',
  })
}
