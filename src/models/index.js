import fs from 'fs'
import path from 'path'
import Sequelize from 'sequelize'
import config from '../../config'

var sequelize = new Sequelize(config.database.name, config.database.user, config.database.password, {
	host: config.database.host,
	port: config.database.port,
	dialect: config.database.dialect,

	pool: {
		max: 5,
		min: 0,
		idle: 10000
	}
})

sequelize
	.authenticate()
	.then(() => {
		console.log('Connection has been established successfully.')
	})
	.catch(err => {
		console.error('Unable to connect to the database:', err)
	})

var db = {}

fs.readdirSync(__dirname)
	.filter(function (file) {
		return (file.indexOf('.') !== 0) && (file !== 'index.js')
	})
	.forEach(function (file) {
		var model = sequelize.import(path.join(__dirname, file))
		db[model.name] = model
	})

Object.keys(db).forEach(function (modelName) {
	if ('associate' in db[modelName]) {
		db[modelName].associate(db)
	}
})

db.sequelize = sequelize

module.exports = db
