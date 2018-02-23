import bcrypt from 'bcrypt'
import config from '../../config'
import jwt from 'jsonwebtoken'
import Sequelize from 'sequelize'

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define('user', {
    type: {
      type: Sequelize.STRING,
      defaultValue: 'User'
    },
    name: {
      type: Sequelize.STRING,
      required: true
    },
    username: {
      type: Sequelize.STRING,
      required: true,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      required: true
    }
  }, {
    // set timestamp true to add attributes (updatedAt, createdAt) to the database
    timestamps: false,
    hooks: {
      beforeSave: (user, options) => {
        if (!user.changed('password')) {
          return sequelize.Promise.reject('not modified')
        }

        return bcrypt.genSalt(10).then(function (salt) {
          return bcrypt.hash(user.password, salt, null)
        }).then(function (hash) {
          user.setDataValue('password', hash)
        }).catch(function (err) {
          return sequelize.Promise.reject(err)
        })
      }
    }
  })

  // force: true will drop the table if it already exists
  User.sync({ force: false }).then(() => {
      // Table created
    return true
  })

  User.prototype.generateToken = function () {
    const user = this
    return jwt.sign({ id: user.id }, config.token)
  }

  User.prototype.validatePassword = function (password) {
    const user = this
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) { return reject(err) }
        resolve(isMatch)
      })
    })
  }

  return User
}
