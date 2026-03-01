const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Función para obtener iniciales (Ej: "Red Dead Redemption" -> "RDR")
function getInitials(title) {
    return title
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
}

async function bulkUpdate() {
    console.log("🔍 Buscando juegos en Neon...");

    try {
        const games = await prisma.game.findMany();
        console.log(`Se procesarán ${games.length} juegos.`);

        for (const game of games) {
            // 1. Lógica para el nombre del archivo:
            // Si el juego es "Max Payne" y la plataforma "PC" -> "MP-PC.jpg"
            // Si el juego es "Mario Kart 8" y la plataforma "Nintendo Switch" -> "MK8-SW.jpg"

            let initials = getInitials(game.title);

            // Ajustes manuales comunes para que coincida con tus fotos:
            if (game.title.includes("Mario Kart 8")) initials = "MK8";
            if (game.title.includes("Red Dead Redemption 2")) initials = "RDR2";

            let platformSuffix = "";
            if (game.platform.includes("PlayStation 5")) platformSuffix = "PS5";
            if (game.platform.includes("PlayStation 4")) platformSuffix = "PS4";
            if (game.platform.includes("PC")) platformSuffix = "PC";
            if (game.platform.includes("Switch")) platformSuffix = "SW";

            const fileName = `${initials}-${platformSuffix}.jpg`;

            // 2. Actualizar en la DB
            // Usamos el path relativo que React entenderá desde la carpeta public
            await prisma.game.update({
                where: { id: game.id },
                data: { imageUrl: `/${fileName}` }
            });

            console.log(`✅ ${game.title} actualizado a: /${fileName}`);
        }

        console.log("✨ ¡Proceso masivo terminado!");
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

bulkUpdate();