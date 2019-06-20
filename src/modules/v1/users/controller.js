import db from '../../../models/index'
import constants from './../../../utils/constants'

/**
 * @api {post} /v1/users Create a new user
 * @apiPermission
 * @apiVersion 1.0.0
 * @apiName CreateUser
 * @apiGroup Users
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X POST -d '{ "user": { "username": "johndoe", "password": "secretpasas" } }' localhost:5000/v1/users
 *
 * @apiParam {Object} user          User object (required)
 * @apiParam {String} user.username Username.
 * @apiParam {String} user.password Password.
 *
 * @apiSuccess {Object}   users           User object
 * @apiSuccess {ObjectId} users._id       User id
 * @apiSuccess {String}   users.name      User name
 * @apiSuccess {String}   users.username  User username
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "user": {
 *          "_id": "56bd1da600a526986cf65c80"
 *          "name": "John Doe"
 *          "username": "johndoe"
 *       }
 *     }
 *
 * @apiError UnprocessableEntity Missing required parameters
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "status": 500,
 *       "error": "Internal Server Error"
 *     }
 */
export async function createUser (ctx) {
	// Create user
	let createdUser
	try {
		const user = await db.user.findOne({
			where: {
				username: ctx.request.body.user.username
			},
			attributes: { exclude: ['password'] }
		})
		if(user) {
			ctx.body = constants.MESSAGES.USER_ALREADY_EXIST;
			ctx.status = constants.STATUS_CODE.CONFLICT_ERROR_STATUS
			return
		}
		createdUser = await db.user.create({
			name: ctx.request.body.user.name,
			username: ctx.request.body.user.username,
			password: ctx.request.body.user.password
		})
		// Generated token is used for authentication
		const token = createdUser.generateToken()
		const response = createdUser.toJSON()
		delete response.password
		ctx.body = {
			user: response
		}
		ctx.append('Authorization', token);
		ctx.status = constants.STATUS_CODE.CREATED_SUCCESSFULLY_STATUS;
	} catch (error) {
		console.log('Error while creating user ', error);
		ctx.body = error.message;
		ctx.status = constants.STATUS_CODE.INTERNAL_SERVER_ERROR_STATUS
	}
}

/**
 * @api {get} /v1/users Get all users
 * @apiPermission user
 * @apiVersion 1.0.0
 * @apiName GetUsers
 * @apiGroup Users
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X GET localhost:5000/v1/users
 *
 * @apiSuccess {Object[]} users           Array of user objects
 * @apiSuccess {ObjectId} users._id       User id
 * @apiSuccess {String}   users.name      User name
 * @apiSuccess {String}   users.username  User username
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "users": [{
 *          "_id": "56bd1da600a526986cf65c80"
 *          "name": "John Doe"
 *          "username": "johndoe"
 *       }]
 *     }
 *
 * @apiUse TokenError
 */
export async function getUsers (ctx) {
	// Get all the users
	try {
		const users = await db.user.findAll({
			attributes: { exclude: ['password'] }
		})
		ctx.body = { users }
		ctx.status = constants.STATUS_CODE.SUCCESS_STATUS;
	} catch (error) {
		ctx.body = error.message;
		ctx.status = constants.STATUS_CODE.INTERNAL_SERVER_ERROR_STATUS
	}
}

/**
 * @api {get} /v1/users/:id Get user by id
 * @apiPermission user
 * @apiVersion 1.0.0
 * @apiName GetUser
 * @apiGroup Users
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X GET localhost:5000/v1/users/56bd1da600a526986cf65c80
 *
 * @apiSuccess {Object}   users           User object
 * @apiSuccess {ObjectId} users._id       User id
 * @apiSuccess {String}   users.name      User name
 * @apiSuccess {String}   users.username  User username
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": {
 *          "_id": "56bd1da600a526986cf65c80"
 *          "name": "John Doe"
 *          "username": "johndoe"
 *       }
 *     }
 *
 * @apiUse TokenError
 */
export async function getUser (ctx) {
	// Find user by id
	try {
		const user = await db.user.findOne({
			where: {
				id: ctx.params.id
			},
			attributes: { exclude: ['password'] }
		})
		// If user was not found
		if (!user) {
			ctx.status = constants.STATUS_CODE.NO_CONTENT_STATUS
			ctx.body = {
				message: constants.MESSAGES.USER_NOT_FOUND
			}
			return
		}
		ctx.status = constants.STATUS_CODE.SUCCESS_STATUS;
		ctx.body = { user }
	} catch (error) {
		ctx.body = error.message;
		ctx.status = constants.STATUS_CODE.INTERNAL_SERVER_ERROR_STATUS
	}
}

/**
 * @api {put} /v1/users/:id Update a user
 * @apiPermission
 * @apiVersion 1.0.0
 * @apiName UpdateUser
 * @apiGroup Users
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X PUT -d '{ "user": { "name": "Cool new Name" } }' localhost:5000/v1/users/56bd1da600a526986cf65c80
 *
 * @apiParam {Object} user          User object (required)
 * @apiParam {String} user.name     Name.
 *
 * @apiSuccess {Object}   users           User object
 * @apiSuccess {ObjectId} users._id       User id
 * @apiSuccess {String}   users.name      Updated name
 * @apiSuccess {String}   users.username  Updated username
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": {
 *          "_id": "56bd1da600a526986cf65c80"
 *          "name": "Cool new name"
 *          "username": "johndoe"
 *       }
 *     }
 *
 * @apiError UnprocessableEntity Missing required parameters
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "status": 500,
 *       "error": "Internal Server Error"
 *     }
 *
 * @apiUse TokenError
 */
export async function updateUser (ctx) {
	// update user
	let updateUser
	try {
		await db.user.update({
			name: ctx.request.body.user.name
		},
		{
			where: {
				id: ctx.params.id
			}
		})
		// Get the updated user from the database
		updateUser = await db.user.findOne({
			where: {
				id: ctx.params.id
			},
			attributes: { exclude: ['password'] }
		})
		ctx.status = constants.STATUS_CODE.SUCCESS_STATUS;
		ctx.body = {
			updateUser
		}
	} catch (error) {
		ctx.body = error.message;
		ctx.status = constants.STATUS_CODE.INTERNAL_SERVER_ERROR_STATUS
	}
}

/**
 * @api {delete} /v1/users/:id Delete a user
 * @apiPermission
 * @apiVersion 1.0.0
 * @apiName DeleteUser
 * @apiGroup Users
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X DELETE localhost:5000/v1/users/56bd1da600a526986cf65c80
 *
 * @apiSuccess {StatusCode} 200
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true
 *     }
 *
 * @apiUse TokenError
 */

export async function deleteUser (ctx) {
	// Find and delete record using id
	try {
		await db.user.destroy({
			where: { id: ctx.params.id }
		})
		ctx.status = constants.STATUS_CODE.SUCCESS_STATUS;
		ctx.body = {
			success: true
		}
	} catch (err) {
		ctx.throw(422, err.message)
	}
}
