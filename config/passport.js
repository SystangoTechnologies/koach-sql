import passport from 'koa-passport'
import db from '../src/models/index'
import { Strategy } from 'passport-local'

passport.serializeUser((user, done) => {
	done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
	try {
		const user = await db.user.findOne({
			where: {
				id: id
			},
			attributes: { exclude: ['password'] }
		})
		done(null, user)
	} catch (err) {
		done(err)
	}
})

passport.use('local', new Strategy({
	usernameField: 'username',
	passwordField: 'password'
}, async (username, password, done) => {
	try {
		const user = await db.user.findOne({
			where: {
				username: username
			}
		})

		if (!user) { return done(null, false) }

		try {
			const isMatch = await user.validatePassword(password)
			if (!isMatch) { return done(null, false) }

			done(null, user)
		} catch (err) {
			done(err)
		}
	} catch (err) {
		return done(err)
	}
}))
