// scripts/migrate-sqlite-to-postgres-v2.ts
import * as sqlite3 from "sqlite3";
import { promisify } from "util";
import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";

// Configuración para PostgreSQL 18
const config = {
  sqlite: {
    path: path.join(__dirname, "..", "finance.db"), // Ruta a tu SQLite
  },
  postgres: {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "", // ← AQUÍ PON TU CONTRASEÑA
    database: "finance_db",
  },
};

// Tipos
type SqliteRow = { [key: string]: any };

class SqliteToPostgresMigrator {
  private sqliteDb: sqlite3.Database;
  private pgClient: Client;

  constructor() {
    this.sqliteDb = new sqlite3.Database(config.sqlite.path);
    this.pgClient = new Client(config.postgres);
  }

  async migrate() {
    console.log("🚀 Iniciando migración de SQLite a PostgreSQL 18...");
    console.log(`📁 SQLite: ${config.sqlite.path}`);
    console.log(
      `📊 PostgreSQL: ${config.postgres.host}:${config.postgres.port}/${config.postgres.database}\n`,
    );

    try {
      // 1. Conectar a PostgreSQL
      console.log("1. Conectando a PostgreSQL...");
      await this.pgClient.connect();
      console.log("   ✅ Conectado a PostgreSQL 18\n");

      // 2. Verificar SQLite
      if (!fs.existsSync(config.sqlite.path)) {
        throw new Error(`Archivo SQLite no encontrado: ${config.sqlite.path}`);
      }
      console.log("2. Archivo SQLite verificado\n");

      // 3. Obtener tablas de SQLite
      console.log("3. Obteniendo tablas de SQLite...");
      const tables = await this.getSqliteTables();
      console.log(`   📋 Tablas encontradas: ${tables.join(", ")}\n`);

      // 4. Crear tablas en PostgreSQL
      console.log("4. Creando estructura en PostgreSQL...");
      for (const table of tables) {
        await this.createPostgresTable(table);
      }

      // 5. Migrar datos
      console.log("5. Migrando datos...");
      let totalMigrated = 0;
      for (const table of tables) {
        const migrated = await this.migrateTableData(table);
        totalMigrated += migrated;
      }

      // 6. Verificar migración
      console.log("\n6. Verificando migración...");
      await this.verifyMigration(tables);

      console.log("\n🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!");
      console.log(`📊 Total registros migrados: ${totalMigrated}`);
      console.log(`🗂️  Total tablas migradas: ${tables.length}`);
    } catch (error) {
      console.error("\n❌ Error durante la migración:", error.message);
      process.exit(1);
    } finally {
      await this.pgClient.end();
      (this.sqliteDb as any).close?.();
      console.log("\n🔒 Conexiones cerradas");
    }
  }

  private async getSqliteTables(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.sqliteDb.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        (err, rows: Array<{ name: string }>) => {
          if (err) reject(err);
          resolve(rows.map((row) => row.name));
        },
      );
    });
  }

  private async getTableColumns(tableName: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.sqliteDb.all(
        `PRAGMA table_info(${tableName})`,
        (err, rows: Array<{ name: string }>) => {
          if (err) reject(err);
          resolve(rows.map((row) => row.name));
        },
      );
    });
  }

  private async getSqliteData(tableName: string): Promise<SqliteRow[]> {
    return new Promise((resolve, reject) => {
      this.sqliteDb.all(`SELECT * FROM "${tableName}"`, (err, rows) => {
        if (err) reject(err);
        resolve(rows as SqliteRow[]);
      });
    });
  }

  private async createPostgresTable(tableName: string): Promise<void> {
    // Para PostgreSQL, usar nombres en plural
    const pgTableName = this.mapTableName(tableName);

    // Obtener estructura de SQLite
    const columns = await this.getTableColumns(tableName);

    // Crear sentencia CREATE TABLE básica
    // (En producción, deberías mapear tipos correctamente)
    const columnDefs = columns.map((col) => `"${col}" TEXT`).join(", ");

    const createSQL = `
      CREATE TABLE IF NOT EXISTS "${pgTableName}" (
        ${columnDefs},
        migrated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await this.pgClient.query(createSQL);
      console.log(`   ✅ Tabla creada: ${pgTableName}`);
    } catch (error) {
      console.log(
        `   ℹ️  Tabla ${pgTableName} ya existe o error: ${error.message}`,
      );
    }
  }

  private async migrateTableData(tableName: string): Promise<number> {
    const pgTableName = this.mapTableName(tableName);
    const rows = await this.getSqliteData(tableName);

    if (rows.length === 0) {
      console.log(`   ⏭️  Tabla ${tableName} vacía, saltando...`);
      return 0;
    }

    console.log(`   📦 Migrando ${tableName} (${rows.length} registros)...`);

    const columns = await this.getTableColumns(tableName);
    let migratedCount = 0;

    for (const row of rows) {
      try {
        const columnNames = columns.map((col) => `"${col}"`).join(", ");
        const values = columns.map((col) => row[col]);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

        const insertSQL = `
          INSERT INTO "${pgTableName}" (${columnNames})
          VALUES (${placeholders})
          ON CONFLICT DO NOTHING
        `;

        await this.pgClient.query(insertSQL, values);
        migratedCount++;
      } catch (error) {
        console.error(`      ❌ Error en registro: ${error.message}`);
      }
    }

    console.log(`      ✅ ${migratedCount}/${rows.length} registros migrados`);
    return migratedCount;
  }

  private async verifyMigration(tables: string[]): Promise<void> {
    console.log("\n   📊 Conteo de registros por tabla:");
    console.log("   " + "-".repeat(40));

    for (const table of tables) {
      const pgTableName = this.mapTableName(table);

      try {
        // Contar en PostgreSQL
        const pgResult = await this.pgClient.query(
          `SELECT COUNT(*) FROM "${pgTableName}"`,
        );
        const pgCount = parseInt(pgResult.rows[0].count);

        // Contar en SQLite
        const sqliteCount = await new Promise<number>((resolve, reject) => {
          this.sqliteDb.get(
            `SELECT COUNT(*) as count FROM "${table}"`,
            (err, row: any) => {
              if (err) reject(err);
              resolve(row?.count || 0);
            },
          );
        });

        const status = pgCount === sqliteCount ? "✅" : "⚠️";
        console.log(
          `   ${status} ${pgTableName}: SQLite=${sqliteCount} → PostgreSQL=${pgCount}`,
        );
      } catch (error) {
        console.log(`   ❌ ${pgTableName}: Error en verificación`);
      }
    }
  }

  private mapTableName(sqliteName: string): string {
    // Mapeo de nombres de tablas SQLite → PostgreSQL
    const mappings: { [key: string]: string } = {
      account: "accounts",
      income: "incomes",
      expense: "expenses",
      planning: "plannings",
      expense_planning: "expense_plannings",
      income_planning: "income_plannings",
    };

    return mappings[sqliteName.toLowerCase()] || sqliteName;
  }
}

// Configurar contraseña
async function main() {
  console.log("\n🔐 Configuración de migración");
  console.log("=".repeat(40));

  // Preguntar por contraseña si no está configurada
  if (!config.postgres.password) {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const password = await new Promise<string>((resolve) => {
      readline.question(
        "Ingresa la contraseña de PostgreSQL (usuario postgres): ",
        resolve,
      );
    });

    readline.close();
    config.postgres.password = password;
  }

  // Ejecutar migración
  const migrator = new SqliteToPostgresMigrator();
  await migrator.migrate();
}

// Manejar errores no capturados
process.on("unhandledRejection", (error) => {
  console.error("❌ Error no manejado:", error);
  process.exit(1);
});

main();
