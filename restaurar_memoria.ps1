# SCRIPT DE RESTAURACIÓN AUTOMÁTICA DE MEMORIA PEIDAGOGOS STEAM
# ID de Conversación: c8249541-1e8b-43af-b513-be774b817127

$ConversationId = "c8249541-1e8b-43af-b513-be774b817127"
$UserHome = [System.Environment]::GetFolderPath('UserProfile')
$TargetBrainDir = Join-Path $UserHome ".geminiantigravityrain$ConversationId"
$ZipFile = Join-Path $PSScriptRoot "MEMORIA_CONVERSACION_PEIDAGOGOS.zip"

Write-Host "🚀 Iniciando restauración automática de la memoria de Antigravity..." -ForegroundColor Green

if (Test-Path $ZipFile) {
    if (-not (Test-Path $TargetBrainDir)) {
        New-Item -ItemType Directory -Path $TargetBrainDir -Force | Out-Null
    }
    Expand-Archive -Path $ZipFile -DestinationPath $TargetBrainDir -Force
    Write-Host "✅ Memoria de conversación ($ConversationId) restaurada con éxito en: $TargetBrainDir" -ForegroundColor Cyan
    Write-Host "🎉 ¡Ya puedes abrir Antigravity en tu nuevo computador con toda la memoria intacta!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Archivo MEMORIA_CONVERSACION_PEIDAGOGOS.zip no encontrado." -ForegroundColor Red
}
