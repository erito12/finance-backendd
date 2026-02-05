# setup-permanent-path.ps1
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURACIÓN PERMANENTE POSTGRESQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$pgPath = "C:\Program Files\PostgreSQL\18\bin"
$psqlExe = "$pgPath\psql.exe"

# 1. Verificar que psql existe
if (-not (Test-Path $psqlExe)) {
    Write-Host "❌ ERROR: psql.exe no encontrado en $pgPath" -ForegroundColor Red
    Write-Host "   PostgreSQL 18 puede no estar instalado correctamente" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ psql.exe encontrado en: $pgPath" -ForegroundColor Green
Write-Host ""

# 2. Agregar al PATH del USUARIO (recomendado, no necesita admin)
Write-Host "2. Agregando PostgreSQL al PATH del usuario..." -ForegroundColor Yellow

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($userPath -like "*$pgPath*") {
    Write-Host "   ℹ️  PostgreSQL ya está en el PATH del usuario" -ForegroundColor Yellow
} else {
    # Agregar al inicio del PATH para prioridad
    $newPath = "$pgPath;$userPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "   ✅ PostgreSQL agregado al PATH del usuario" -ForegroundColor Green
}

# 3. Agregar también al PATH de la MÁQUINA (opcional, necesita admin)
Write-Host ""
Write-Host "3. Agregando PostgreSQL al PATH del sistema..." -ForegroundColor Yellow

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if ($isAdmin) {
    $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    
    if ($machinePath -like "*$pgPath*") {
        Write-Host "   ℹ️  PostgreSQL ya está en el PATH del sistema" -ForegroundColor Yellow
    } else {
        $newMachinePath = "$pgPath;$machinePath"
        [Environment]::SetEnvironmentVariable("Path", $newMachinePath, "Machine")
        Write-Host "   ✅ PostgreSQL agregado al PATH del sistema" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️  Se necesita ejecutar como Administrador para PATH del sistema" -ForegroundColor Yellow
    Write-Host "   Para ejecutar como admin: Click derecho en PowerShell → 'Ejecutar como administrador'" -ForegroundColor White
}

# 4. Actualizar PATH de esta sesión
Write-Host ""
Write-Host "4. Actualizando PATH de esta sesión..." -ForegroundColor Yellow
$env:Path = "$pgPath;$env:Path"
Write-Host "   ✅ PATH de sesión actualizado" -ForegroundColor Green

# 5. Verificar
Write-Host ""
Write-Host "5. Verificando configuración..." -ForegroundColor Yellow

# Probar psql
try {
    $version = & $psqlExe --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ psql funcionando: $version" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Error al ejecutar psql: $_" -ForegroundColor Red
}

# Mostrar PATH actual
Write-Host ""
Write-Host "📋 PATH actual contiene PostgreSQL:" -ForegroundColor Cyan
$env:Path -split ';' | Where-Object { $_ -like "*postgresql*" } | ForEach-Object {
    Write-Host "   $_" -ForegroundColor White
}

# 6. Crear alias para PowerShell (opcional pero útil)
Write-Host ""
Write-Host "6. Creando alias para PowerShell..." -ForegroundColor Yellow

$profileDir = Split-Path $PROFILE -Parent
if (-not (Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force
}

$aliasScript = @"
# Aliases para PostgreSQL
function Get-PostgresPath { "C:\Program Files\PostgreSQL\18\bin" }
function Set-PostgresPath { `$env:Path = "C:\Program Files\PostgreSQL\18\bin;`$env:Path" }

# Alias para psql con contraseña
function psql-finance {
    param([string]`$Password)
    `$env:PGPASSWORD = `$Password
    & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5432 -U postgres -d finance_db @args
    `$env:PGPASSWORD = `$null
}

# Función para conectar fácilmente
function Connect-Postgres {
    `$pass = Read-Host "Contraseña PostgreSQL" -AsSecureString
    `$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR(`$pass)
    `$plainPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(`$BSTR)
    
    `$env:PGPASSWORD = `$plainPass
    & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5432 -U postgres -d finance_db
    
    `$env:PGPASSWORD = `$null
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR(`$BSTR)
}

Write-Host "✅ Aliases PostgreSQL cargados" -ForegroundColor Green
"@

$aliasScript | Out-File -FilePath "$profileDir\postgres-aliases.ps1" -Encoding UTF8

# Agregar al perfil si no existe
if (-not (Test-Path $PROFILE)) {
    "" | Out-File -FilePath $PROFILE -Encoding UTF8
}

$profileContent = Get-Content $PROFILE -ErrorAction SilentlyContinue
if ($profileContent -notlike "*postgres-aliases*") {
    Add-Content -Path $PROFILE -Value "`n. `"$profileDir\postgres-aliases.ps1`""
    Write-Host "   ✅ Alias agregados al perfil de PowerShell" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Alias ya existen en el perfil" -ForegroundColor Yellow
}

# 7. Instrucciones finales
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 ACCIONES REQUERIDAS:" -ForegroundColor Cyan
Write-Host "1. CIERRA TODAS las ventanas de PowerShell" -ForegroundColor Red
Write-Host "2. VUELVE a abrir PowerShell" -ForegroundColor Red
Write-Host "3. Verifica con: psql --version" -ForegroundColor White
Write-Host ""
Write-Host "🔧 NUEVOS COMANDOS DISPONIBLES:" -ForegroundColor Cyan
Write-Host "   psql --version                    - Ver versión" -ForegroundColor White
Write-Host "   Connect-Postgres                  - Conectar interactivamente" -ForegroundColor White
Write-Host "   psql-finance -c 'SELECT 1;'      - Ejecutar query" -ForegroundColor White
Write-Host ""
Write-Host "📁 Para tu proyecto:" -ForegroundColor Cyan
Write-Host "   - Tu archivo .env ya está listo" -ForegroundColor White
Write-Host "   - Tu app.module.ts ya está actualizado" -ForegroundColor White
Write-Host "   - Ejecuta: npm run start:dev" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')