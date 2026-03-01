const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateImages() {
    console.log("🖼️ Iniciando actualización de imágenes...");

    // Este mapa asocia el Título de tu DB con el nombre del archivo en /public
    // Ajústalo según los nombres exactos que tengas en tu tabla 'Game'
    const imageMap = {
        "Red Dead Redemption 2": "RDR2-PS4.jpg",
        "Max Payne": "MP1-PC.jpg",
        "Max Payne 2": "MP2-PS2.jpg",
        "Unravel Two": "UNRTWO-PC.jpg",
        "Mario Kart 8 Deluxe": "MK8-SW.jpg",
        "The Last of Us Part I": "TLOU-PS4.jpg",
        // Agrega aquí los demás...
    };

    try {
        for (const [title, fileName] of Object.entries(imageMap)) {
            await prisma.game.updateMany({
                where: { title: title },
                data: { imageUrl: `/public/${fileName}` }
            });
            console.log(`✅ Actualizado: ${title} -> ${fileName}`);
        }
        console.log("✨ Proceso terminado.");
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

updateImages();