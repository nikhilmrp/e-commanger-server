import { Sequelize, Options } from "sequelize";
import logger from "../utils/logger";

const {
  DB_HOST = "localhost",
  DB_PORT = "3306",
  DB_NAME = "ecommerce_db",
  DB_USER = "root",
  DB_PASSWORD = "",
  NODE_ENV = "development",
} = process.env;

const getDBConfig = (): Options => {
  return {
    host: DB_HOST,
    port: parseInt(DB_PORT),
    dialect: "mysql",
    logging: NODE_ENV === "development" ? (msg) => logger.debug(msg) : false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    },
    dialectOptions: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      decimalNumbers: true,
      ...(NODE_ENV === "production" && {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }),
    },
    pool: {
      max: NODE_ENV === "production" ? 20 : 10,
      min: NODE_ENV === "production" ? 5 : 0,
      acquire: 60000,
      idle: 10000,
    },
    timezone: "+00:00",
  };
};

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, getDBConfig());

export default sequelize;
