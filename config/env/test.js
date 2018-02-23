export default {
  session: process.env.SESSION || 'secret-boilerplate-token',
  token: process.env.TOKEN || 'secret-jwt-token',
  database: {
    name: process.env.DATABASE || 'koach_test',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_DBPORT || '3306',
    dialect: process.env.DB_DIALECT || 'mysql'
  }
}
