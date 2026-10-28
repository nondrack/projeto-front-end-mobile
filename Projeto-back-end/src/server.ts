import app from "./app";
import sequelize from "./config/database";
import { DataTypes } from "sequelize";
import { connectRedis } from "./services/redisCache.service";
import { connectEventBus } from "./services/redisEventBus.service";
import logger from "./utils/logger";

const port = 3000;

interface IndexField {
  attribute?: string;
}

interface IndexMetadata {
  unique?: boolean;
  fields?: IndexField[];
}

async function ensureUsuariosCpfColumn() {
  const queryInterface = sequelize.getQueryInterface();
  const tableDescription = await queryInterface.describeTable("usuarios");

  if (!Object.prototype.hasOwnProperty.call(tableDescription, "cpf")) {
    await queryInterface.addColumn("usuarios", "cpf", {
      type: DataTypes.STRING(14),
      allowNull: true,
    });
  }

  const indexesRaw = await queryInterface.showIndex("usuarios");
  const indexes: IndexMetadata[] = Array.isArray(indexesRaw) ? (indexesRaw as IndexMetadata[]) : [];
  const hasUniqueCpfIndex = indexes.some((index) => {
    const fields = Array.isArray(index.fields)
      ? index.fields.map((field) => String(field.attribute || ""))
      : [];
    return index.unique === true && fields.includes("cpf");
  });

  if (!hasUniqueCpfIndex) {
    await queryInterface.addIndex("usuarios", ["cpf"], {
      unique: true,
      name: "usuarios_cpf_unique",
    });
  }
}

async function startServer() {
  try {
    await connectRedis();
    await connectEventBus();
    await sequelize.authenticate();
    await ensureUsuariosCpfColumn();
    await sequelize.sync();

    app.listen(port, () => {
      logger.info("server.started", { port });
    });
  } catch (error) {
    logger.error("server.startup.failed", error, { port });
    process.exit(1);
  }
}

startServer();