const Sequelize = require('sequelize')

const sequelize = new Sequelize('shop', 'root', '12345', {
  dialect: 'mysql',
  host: 'localhost',
})

module.exports = sequelize
