// Script para ejecutar migraciones automáticamente en Render
const { execSync } = require('child_process');

console.log('🔄 Verificando migraciones de base de datos...');

try {
    // Generar el cliente de Prisma
    console.log('📦 Generando Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Aplicar cambios a la base de datos
    console.log('🗄️ Aplicando cambios a la base de datos...');
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
    
    console.log('✅ Migraciones completadas exitosamente!');
} catch (error) {
    console.error('❌ Error en las migraciones:', error.message);
    process.exit(1);
}
