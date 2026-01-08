const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// 1. Obtener todos los juegos
app.get('/games', async (req, res) => {

    const games = await prisma.game.findMany({
        orderBy: { createdAt: 'desc' }
    });

    res.json(games);
});

// 2. Crear un nuevo juego
app.post('/games', async (req, res) => {
    const { title, platform, pcStore, status, rating, imageUrl, description, targetYear, replayable } = req.body;
    
    const newGame = await prisma.game.create({
        data: { 
            title, 
            platform, 
            pcStore: platform === 'PC' ? (pcStore || null) : null,
            status, 
            rating: rating ? parseFloat(rating) : null,
            imageUrl: imageUrl || null,
            description: description || null,
            targetYear: targetYear ? parseInt(targetYear) : null,
            replayable: status === 'Completado' ? (replayable === 'true' || replayable === true) : null
        }
    });

    res.json(newGame);
});

// 3. Actualizar un juego existente
app.put('/games/:id', async (req, res) => {
    const { id } = req.params;
    const { title, platform, pcStore, status, rating, imageUrl, description, targetYear, replayable } = req.body;
    
    const updatedGame = await prisma.game.update({
        where: { id: parseInt(id) },
        data: { 
            title, 
            platform, 
            pcStore: platform === 'PC' ? (pcStore || null) : null,
            status, 
            rating: rating ? parseFloat(rating) : null,
            imageUrl: imageUrl || null,
            description: description || null,
            targetYear: targetYear ? parseInt(targetYear) : null,
            replayable: status === 'Completado' ? (replayable === 'true' || replayable === true) : null
        }
    });

    res.json(updatedGame);
});

// 4. Eliminar juego 
app.delete('/games/:id', async (req, res) => {
    const { id } = req.params;

    await prisma.game.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Juego eliminado' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})