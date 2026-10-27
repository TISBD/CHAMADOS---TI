@echo off
title HelpDesk Pro - Publicar no GitHub
echo ========================================================
echo   HelpDesk Pro - Publicacao no GitHub
echo ========================================================
echo.

set "PATH=C:\Users\Sb Despachos\AppData\Local\Programs\MinGit\cmd;%PATH%"

echo Repositorio Git local pronto e commitado com sucesso!
echo.
echo 1. Crie um novo repositorio vazio no seu GitHub (https://github.com/new).
echo 2. Nao marque 'Add a README' ou '.gitignore' (pois o projeto ja tem).
echo 3. Copie a URL do seu repositorio.
echo.
set /p REPO_URL="Cole a URL do seu repositorio no GitHub e aperte ENTER: "

if "%REPO_URL%"=="" (
  echo Nenhuma URL informada. Operacao cancelada.
  pause
  exit /b
)

echo.
echo Conectando ao repositorio remoto...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git branch -M main

echo.
echo Enviando arquivos para o GitHub (git push -u origin main)...
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
  echo ========================================================
  echo   SUCESSO! O projeto foi publicado no seu GitHub.
  echo ========================================================
) else (
  echo ========================================================
  echo   Falha no envio. Verifique suas credenciais do GitHub.
  echo ========================================================
)

echo.
pause
