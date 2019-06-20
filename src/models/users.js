import bcrypt from 'bcryptjs'
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
				try {
					if (!user.changed('password')) {
						return Sequelize.Promise.reject('not modified')
					}
					let salt = bcrypt.genSaltSync(10)
					var hash = bcrypt.hashSync(user.password, salt)
					user.setDataValue('password', hash)
				} catch (error) {
					return Sequelize.Promise.reject(error)
				}
			}
		}
	})

	// force: true will drop the table if it already exists
	User.sync({
		force: false
	}).then(() => {
		// Table created
		return true
	})

	User.prototype.generateToken = function () {
		const user = this
		return jwt.sign({
			id: user.id
		}, config.token)
	}

	User.prototype.validatePassword = function (password) {
		const user = this
		return new Promise((resolve, reject) => {
			try {
				let isMatch = bcrypt.compareSync(password, user.password)
				resolve(isMatch)
			} catch (error) {
				resolve(false)
			}
		})
	}

	return User
}
