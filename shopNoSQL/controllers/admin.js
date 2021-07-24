const Product = require('../models/product')

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  })
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title
  const imageUrl = req.body.imageUrl
  const description = req.body.description
  const price = req.body.price

  const product = new Product({
    title,
    price,
    imageUrl,
    description,
    userId: req.user,
  })

  product
    .save()
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit

  if (!editMode) return res.redirect('/')

  const prodId = req.params.productId

  Product.findById(prodId).then(product => {
    if (!product) return res.redirect('/')

    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product,
    })
  })
}

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId
  const title = req.body.title
  const imageUrl = req.body.imageUrl
  const description = req.body.description
  const price = req.body.price

  Product.findById(prodId)
    .then(product => {
      product.title = title
      product.price = price
      product.imageUrl = imageUrl
      product.description = description

      return product.save()
    })
    .then(() => res.redirect('/admin/products'))
}

exports.getProducts = (req, res, next) => {
  Product.find()
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      console.log(products)
      res.render('admin/products', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        prods: products,
      })
    })
}

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId

  Product.findByIdAndRemove(productId).then(() =>
    res.redirect('/admin/products')
  )
}
