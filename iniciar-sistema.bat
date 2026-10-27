@echo off
title HelpDesk Pro - Sistema de Chamados de TI e Suporte
echo ========================================================
echo   HelpDesk Pro - Iniciando Sistema de TI ^& Suporte
echo ========================================================
echo.

set "NODE_CMD="
where node >nul 2>&1 && set "NODE_CMD=node"
if exist "C:\Program Files\nodejs\node.exe" set "NODE_CMD=C:\Program Files\nodejs\node.exe"

if defined NODE_CMD (
  echo Iniciando servidor local na porta 8080...
  start "" "http://localhost:8080"
  "%NODE_CMD%" server.js
) else (
  echo Abrindo sistema diretamente no navegador padrao...
  start "" "index.html"
)
