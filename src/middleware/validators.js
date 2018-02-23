import db from '../models/index'
import config from '../../config'
import { getToken } from '../utils/auth'
import { verify } from 'jsonwebtoken'

export async function ensureUser (ctx, next) {
  const token = getToken(ctx)

  if (!token) {
    ctx.throw(401)
  }

  let decoded = null
  try {
    decoded = verify(token, config.token)
  } catch (err) {
    ctx.throw(401)
  }

  ctx.state.user = await db.user.findById(decoded.id)
  if (!ctx.state.user) {
    ctx.throw(401)
  }

  return next()
}
