import { Sequelize } from 'sequelize';
import "dotenv/config";

// Define the database connection configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || process.env.MYSQL_DATABASE || 'cinema_db',
  process.env.DB_USER || process.env.MYSQL_USER || 'app',
  process.env.DB_PASS || process.env.MYSQL_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3307'),
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: false,
    },
  }
);

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
  })
  .catch((error: Error) => {
    console.error('Unable to connect to the database:', error);
  });

export default sequelize;

// import { Sequelize } from "sequelize";
// import "dotenv/config";

// const sequelize = new Sequelize(
//     "cinema_db",
//     "root",
//     "1234",
//     {
//         host: 'localhost',
//         port: 3306,
//         dialect: 'mysql', // ou mysql
//         logging: true
//     }
// );

// export default sequelize;