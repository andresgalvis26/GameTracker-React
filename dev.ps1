# ============================================================
#  GameTracker - Inicia el servidor de desarrollo (Vite)
#  Uso:  powershell -ExecutionPolicy Bypass -File .\dev.ps1
#        o bien  .\dev.ps1  (si la politica lo permite)
# ============================================================

$ErrorActionPreference = 'Stop'

# Carpeta donde esta este script (raiz del repo)
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$clientDir = Join-Path $root 'client'

# Moverse a client
if (-not (Test-Path $clientDir)) {
    Write-Host "[ERROR] No se encontro la carpeta 'client' en $root" -ForegroundColor Red
    exit 1
}
Set-Location $clientDir

# Verificar package.json
if (-not (Test-Path (Join-Path $clientDir 'package.json'))) {
    Write-Host "[ERROR] No se encontro package.json en $clientDir" -ForegroundColor Red
    exit 1
}

# Instalar dependencias si falta node_modules
if (-not (Test-Path (Join-Path $clientDir 'node_modules'))) {
    Write-Host "[INFO] No se encontro node_modules. Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Fallo la instalacion de dependencias." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

# Iniciar servidor de desarrollo
Write-Host "[INFO] Iniciando servidor de desarrollo en $clientDir ..." -ForegroundColor Green
npm run dev
