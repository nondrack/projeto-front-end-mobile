import app from "./app";
import sequelize from "./config/database";
import { DataTypes } from "sequelize";

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
    await sequelize.authenticate();
    await ensureUsuariosCpfColumn();
    await sequelize.sync();

    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  } catch (error) {
    console.error("Falha ao iniciar o servidor:", error);
    process.exit(1);
  }
}

startServer();