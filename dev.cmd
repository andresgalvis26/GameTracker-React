@echo off
REM ============================================================
REM  GameTracker - Inicia el servidor de desarrollo (Vite)
REM  Uso: doble clic o ejecutar  dev.cmd  desde la raiz
REM ============================================================

setlocal

REM Moverse a la carpeta del proyecto cliente
cd /d "%~dp0client" || (
    echo [ERROR] No se pudo entrar en la carpeta "client".
    pause
    exit /b 1
)

REM Verificar que existe package.json
if not exist "package.json" (
    echo [ERROR] No se encontro package.json en %CD%
    pause
    exit /b 1
)

REM Instalar dependencias si falta node_modules
if not exist "node_modules" (
    echo [INFO] No se encontro node_modules. Instalando dependencias...
    call npm install || (
        echo [ERROR] Fallo la instalacion de dependencias.
        pause
        exit /b 1
    )
)

echo [INFO] Iniciando servidor de desarrollo en %CD% ...
call npm run dev

REM Pausar solo si algo fallo (para ver el error al hacer doble clic)
if errorlevel 1 (
    echo.
    echo [ERROR] El servidor termino con errores.
    pause
)

endlocal
