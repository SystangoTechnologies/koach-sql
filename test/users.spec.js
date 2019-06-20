/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import app from '../bin/server'
import supertest from 'supertest'
import { expect, should } from 'chai'
import { cleanDb } from './utils'

should()
const request = supertest.agent(app.listen())
const context = {}
var userID = 0

describe('Users', () => {
	before((done) => {
		cleanDb()
		done()
	})

	describe('POST /v1/users', () => {
		it('should reject signup when data is incomplete', (done) => {
			request
				.post('/v1/users')
				.set('Accept', 'application/json')
				.send({ user: {
					username: 'supercoolname'
				} })
				.expect(500, done)
		})

		it('should sign up', (done) => {
			request
				.post('/v1/users')
				.set('Accept', 'application/json')
				.send({ user: { username: 'supercoolname', password: 'supersecretpassword' } })
				.expect(201, (err, res) => {
					if (err) { return done(err) }

					res.body.user.should.have.property('username')
					res.body.user.username.should.equal('supercoolname')
					// eslint-disable-next-line no-unused-expressions
					expect(res.body.user.password).to.not.exist

					context.user = res.body.user
					context.token = res.headers.authorization
					userID = res.body.user.id

					done()
				})
		})
	})

	describe('GET /v1/users', () => {
		it('should not fetch users if the authorization header is missing', (done) => {
			request
				.get('/v1/users')
				.set('Accept', 'application/json')
				.expect(401, done)
		})

		it('should not fetch users if the authorization header is missing the scheme', (done) => {
			request
				.get('/v1/users')
				.set({
					Accept: 'application/json',
					Authorization: '1'
				})
				.expect(401, done)
		})

		it('should not fetch users if the authorization header has invalid scheme', (done) => {
			const { token } = context
			request
				.get('/v1/users')
				.set({
					Accept: 'application/json',
					Authorization: `Unknown ${token}`
				})
				.expect(401, done)
		})

		it('should not fetch users if token is invalid', (done) => {
			request
				.get('/v1/users')
				.set({
					Accept: 'application/json',
					Authorization: 'Bearer 1'
				})
				.expect(401, done)
		})

		it('should fetch all users', (done) => {
			const { token } = context
			request
				.get('/v1/users')
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${token}`
				})
				.expect(200, (err, res) => {
					if (err) { return done(err) }

					res.body.should.have.property('users')

					res.body.users.should.have.length(1)

					done()
				})
		})
	})

	describe('GET /v2/users', () => {
		it('should not fetch users if the authorization header is missing for version 2', (done) => {
			request
				.get('/v2/users')
				.set('Accept', 'application/json')
				.expect(401, done)
		})

		it('should not fetch users if the authorization header is missing the scheme', (done) => {
			request
				.get('/v2/users')
				.set({
					Accept: 'application/json',
					Authorization: '1'
				})
				.expect(401, done)
		})

		it('should not fetch users if the authorization header has invalid scheme', (done) => {
			const { token } = context
			request
				.get('/v2/users')
				.set({
					Accept: 'application/json',
					Authorization: `Unknown ${token}`
				})
				.expect(401, done)
		})

		it('should not fetch users if token is invalid', (done) => {
			request
				.get('/v2/users')
				.set({
					Accept: 'application/json',
					Authorization: 'Bearer 1'
				})
				.expect(401, done)
		})

		it('should fetch all users', (done) => {
			const { token } = context
			request
				.get('/v2/users')
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${token}`
				})
				.expect(200, (err, res) => {
					if (err) { return done(err) }

					res.body.should.have.property('users')

					res.body.users.should.have.length(1)

					done()
				})
		})
	})

	describe('POST /auth', () => {
		it('should throw 401 if credentials are incorrect', (done) => {
			request
				.post('/v1/auth')
				.set('Accept', 'application/json')
				.send({ username: 'supercoolname', password: 'wrongpassword' })
				.expect(401, done)
		})

		it('should auth user', (done) => {
			request
				.post('/v1/auth')
				.set('Accept', 'application/json')
				.send({ username: 'supercoolname', password: 'supersecretpassword' })
				.expect(200, (err, res) => {
					if (err) { return done(err) }

					res.body.user.should.have.property('username')
					res.body.user.username.should.equal('supercoolname')
					// eslint-disable-next-line no-unused-expressions
					expect(res.body.user.password).to.not.exist

					context.user = res.body.user
					context.token = res.headers.authorization

					done()
				})
		})
	})

	describe('GET /v1/users/:id', () => {
		it('should not fetch user if token is invalid', (done) => {
			request
				.get('/v1/users/1')
				.set({
					Accept: 'application/json',
					Authorization: 'Bearer 1'
				})
				.expect(401, done)
		})

		it('should throw 204 if user doesn\'t exist', (done) => {
			const { token } = context
			request
				.get('/v1/users/1')
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${token}`
				})
				.expect(204, done)
		})

		it('should fetch user', (done) => {
			const { token } = context

			request
				.get(`/v1/users/${userID}`)
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${token}`
				})
				.expect(200, (err, res) => {
					if (err) { return done(err) }

					res.body.should.have.property('user')

					expect(res.body.user.password).to.not.exist

					done()
				})
		})
	})

	describe('PUT /v1//users/:id', () => {
		it('should not update user if token is invalid', (done) => {
			request
				.put('/v1/users/1')
				.set({
					Accept: 'application/json',
					Authorization: 'Bearer 1'
				})
				.expect(401, done)
		})

		it('should update user', (done) => {
			const { token } = context

			request
				.put(`/v1/users/${userID}`)
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${token}`
				})
				.send({ user: { name: 'updatedcoolname' } })
				.expect(200, (err, res) => {
					if (err) { return done(err) }
					res.body.updateUser.should.have.property('name')
					res.body.updateUser.name.should.equal('updatedcoolname')
					expect(res.body.updateUser.password).to.not.exist
					done()
				})
		})
	})

	describe('DELETE /v1/users/:id', () => {
		it('should not delete user if token is invalid', (done) => {
			request
				.delete('/v1/users/1')
				.set({
					Accept: 'application/json',
					Authorization: 'Bearer 1'
				})
				.expect(401, done)
		})

		it('should delete user', (done) => {
			const { token } = context

			request
				.delete(`/v1/users/${userID}`)
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${token}`
				})
				.expect(200, done)
		})
	})
})
