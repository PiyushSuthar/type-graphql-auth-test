require('dotenv').config()

module.exports = {
   "type": "postgres",
   "name": "default",
   "host": "localhost",
   "port": 5432,
   "username": "piyushsuthar",
   "password": process.env.DB_PASS,
   "database": "ts_gql_boilerplate",
   "synchronize": true,
   "logging": false,
   "entities": [
      "src/entity/**/*.ts"
   ],
   "migrations": [
      "src/migration/**/*.ts"
   ],
   "subscribers": [
      "src/subscriber/**/*.ts"
   ],
   "cli": {
      "entitiesDir": "src/entity",
      "migrationsDir": "src/migration",
      "subscribersDir": "src/subscriber"
   }
}