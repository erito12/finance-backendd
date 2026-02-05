# setup-permanent-path-simple.ps1 - Versión SIMPLIFICADA
Write-Host "Configurando PostgreSQL en el PATH..." -ForegroundColor Yellow

# 1. Ruta de PostgreSQL 18
$pgPath = "C:\Program Files\PostgreSQL\18\bin"
$psqlExe = "$pgPath\psql.exe"

# 2. Verificar que existe
if (-not (Test-Path $psqlExe)) {
    Write-Host "ERROR: psql.exe no encontrado en:" -ForegroundColor Red
    Write-Host "  $pgPath" -ForegroundColor White
    Write-Host ""
    Write-Host "Solución: Usa la ruta completa temporalmente:" -ForegroundColor Yellow
    Write-Host "  & `"$psqlExe`" --version" -ForegroundColor Green
    pause
    exit 1
}

Write-Host "✅ PostgreSQL encontrado en: $pgPath" -ForegroundColor Green

# 3. Agregar al PATH del USUARIO (simple)
Write-Host "Agregando al PATH del usuario..." -ForegroundColor Yellow

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$pgPath*") {
    $newPath = "$pgPath;$userPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "✅ PATH actualizado (usuario)" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Ya está en el PATH" -ForegroundColor Yellow
}

# 4. Actualizar PATH de esta sesión
$env:Path = "$pgPath;$env:Path"
Write-Host "✅ PATH de sesión actualizado" -ForegroundColor Green

# 5. Verificar
Write-Host ""
Write-Host "Probando psql..." -ForegroundColor Cyan
& $psqlExe --version

Write-Host ""
Write-Host "🎯 CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "Cierra y reabre PowerShell para que los cambios sean permanentes" -ForegroundColor Yellow
Write-Host ""
Write-Host "Prueba con: psql --version" -ForegroundColor White
pause