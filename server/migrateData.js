const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function migrate() {
    const prisma = new PrismaClient(); // Esto conectará a NEON (vía tu .env)

    // 1. Abrir la base de datos vieja (SQLite)
    const db = await open({
        filename: './prisma/dev.db',
        driver: sqlite3.Database
    });

    console.log("🚀 Iniciando migración a Neon...");

    try {
        // 2. Leer los juegos de SQLite (Cambia 'Game' por el nombre de tu tabla)
        const games = await db.all('SELECT * FROM Game');
        console.log(`Encontrados ${games.length} juegos en SQLite.`);

        // 3. Insertar en Neon
        for (const game of games) {
            await prisma.game.create({
                data: {
                    title: game.title,
                    platform: game.platform,
                    status: game.status,
                    // Añade aquí todos los campos que tengas en tu modelo
                }
            });
        }

        console.log("✅ ¡Migración completada con éxito!");
    } catch (error) {
        console.error("❌ Error durante la migración:", error);
    } finally {
        await prisma.$disconnect();
        await db.close();
    }
}

migrate();