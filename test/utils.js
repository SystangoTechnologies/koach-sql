import db from '../src/models/index'
import Sequelize from 'sequelize'

export async function cleanDb () {
	try {
		await db.user.destroy({
			where: { username: {
				[Sequelize.Op.or]: ['supercoolname', 'test', 'updatedcoolname']
			} }
		})
	} catch (err) {
		console.log(' Error ', err)
	}
}

export function authUser (agent, callback) {
	agent
		.post('/v1/users')
		.set('Accept', 'application/json')
		.send({ user: { username: 'test', password: 'pass' } })
		.end((err, res) => {
			if (err) { return callback(err) }

			callback(null, {
				user: res.body.user,
				token: res.body.token
			})
		})
}
