const crypto = require('crypto')

const bcrypt = require('bcryptjs')

const User = require('../models/user')

exports.getLogin = (req, res, next) => {
  const errorMessage = req.flash('error')[0] || null

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage,
  })
}

exports.postLogin = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password

  User.findOne({ email }).then(user => {
    if (!user) {
      req.flash('error', 'Invalid email or password!')
      return res.redirect('/login')
    }

    bcrypt.compare(password, user.password).then(doMatch => {
      if (!doMatch) {
        req.flash('error', 'Invalid email or password!')
        return res.redirect('/login')
      }

      req.session.isLoggedIn = true
      req.session.user = user
      req.session.save(() => res.redirect('/'))
    })
  })
}

exports.getSignup = (req, res, next) => {
  const errorMessage = req.flash('error')[0] || null

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage,
  })
}

exports.postSignup = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword

  User.findOne({ email })
    .then(userDocument => {
      if (userDocument) {
        req.flash('error', 'E-Mail already exists!')
        return res.redirect('/signup')
      }

      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            email,
            password: hashedPassword,
            cart: { items: [] },
          })
          return user.save()
        })
        .then(() => res.redirect('/login'))
    })
    .catch(err => console.log(err))
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => res.redirect('/'))
}

exports.getReset = (req, res, next) => {
  const errorMessage = req.flash('error')[0] || null

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage,
  })
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) return res.redirect('/reset')

    const token = buffer.toString('hex')

    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email found!')
          return res.redirect('/reset')
        }

        user.resetToken = token
        user.resetTokenExpiration = Date.now() + 3600000

        return user.save()
      })
      .then(() => res.redirect('/')) // send email with token
      .catch(err => console.log(err))
  })
}
