// test-postgres-connection.ts
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { Account } from "./src/entities/account.entity";
import { Income } from "./src/entities/income.entity";
import { Expense } from "./src/entities/expense.entity";

dotenv.config();

async function testConnection() {
  console.log("🔍 Probando conexión de NestJS a PostgreSQL 18...\n");

  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "finance_db",
    entities: [Account, Income, Expense],
    synchronize: false,
    logging: true,
  });

  try {
    // 1. Conectar
    console.log("1. Conectando a PostgreSQL...");
    await dataSource.initialize();
    console.log("✅ Conexión exitosa\n");

    // 2. Verificar tablas
    console.log("2. Verificando tablas...");
    const tables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`📋 Tablas encontradas (${tables.length}):`);
    tables.forEach((table: any) => {
      console.log(`   - ${table.table_name}`);
    });

    // 3. Contar registros
    console.log("\n3. Contando registros...");
    for (const table of tables) {
      const count = await dataSource.query(
        `SELECT COUNT(*) FROM "${table.table_name}"`,
      );
      console.log(`   ${table.table_name}: ${count[0].count} registros`);
    }

    // 4. Probar consulta específica
    console.log('\n4. Probando consulta a "accounts"...');
    const accounts = await dataSource.getRepository(Account).find();
    console.log(`   Cuentas encontradas: ${accounts.length}`);

    if (accounts.length > 0) {
      console.log("   Primera cuenta:");
      console.log(`     ID: ${accounts[0].account_id}`);
      console.log(`     Nombre: ${accounts[0].account_name}`);
      console.log(`     Tipo: ${accounts[0].account_type}`);
      console.log(`     Monto: $${accounts[0].account_amount}`);
    }

    // 5. Probar insert
    console.log("\n5. Probando operación INSERT...");
    const testAccount = {
      account_name: "Cuenta de Prueba NestJS",
      account_type: "Efectivo",
      account_amount: 1000.0,
    };

    const insertResult = await dataSource.query(
      `INSERT INTO accounts (account_name, account_type, account_amount) 
       VALUES ($1, $2, $3) 
       RETURNING account_id`,
      [
        testAccount.account_name,
        testAccount.account_type,
        testAccount.account_amount,
      ],
    );

    console.log(
      `   ✅ Insert exitoso. ID generado: ${insertResult[0].account_id}`,
    );

    // 6. Limpiar (opcional)
    await dataSource.query(`DELETE FROM accounts WHERE account_name = $1`, [
      testAccount.account_name,
    ]);
    console.log("   🧹 Registro de prueba eliminado");

    console.log("\n🎉 ¡Todas las pruebas pasaron exitosamente!");
    console.log("\n✅ Tu aplicación NestJS está lista para usar PostgreSQL 18");
  } catch (error) {
    console.error("\n❌ Error en la conexión:", error.message);
    console.error("\n🔧 Solución:");
    console.error("1. Verifica las credenciales en .env");
    console.error("2. Asegúrate que PostgreSQL esté corriendo");
    console.error("3. Verifica que la BD finance_db exista");
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log("\n🔒 Conexión cerrada");
    }
  }
}

testConnection();
