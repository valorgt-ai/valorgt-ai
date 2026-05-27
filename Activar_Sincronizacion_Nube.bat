@echo off
title Activar Sincronizacion en la Nube - ValorGT AI
echo ==========================================================
echo   ACTIVANDO SINCRONIZACION EN LA NUBE PARA VALORGT AI
echo ==========================================================
echo.
echo Este script movera tus carpetas de configuracion e historial
echo a OneDrive y creara enlaces simbolicos de forma segura.
echo.
echo IMPORTANTE: Cierra la aplicacion Antigravity IDE / VS Code
echo antes de continuar para liberar los archivos bloqueados.
echo.
pause
echo.

:: Verificar y crear directorio de OneDrive
if not exist "C:\Users\sgali\OneDrive\.gemini" mkdir "C:\Users\sgali\OneDrive\.gemini"

:: Procesar antigravity-ide
echo Procesando historial de chats (antigravity-ide)...
if exist "C:\Users\sgali\.gemini\antigravity-ide" (
    if not exist "C:\Users\sgali\OneDrive\.gemini\antigravity-ide" (
        echo Copiando archivos a OneDrive...
        xcopy /E /I /H /Y "C:\Users\sgali\.gemini\antigravity-ide" "C:\Users\sgali\OneDrive\.gemini\antigravity-ide"
    )
    echo Renombrando carpeta original como respaldo...
    ren "C:\Users\sgali\.gemini\antigravity-ide" "antigravity-ide_backup"
    echo Creando enlace inteligente hacia OneDrive...
    mklink /J "C:\Users\sgali\.gemini\antigravity-ide" "C:\Users\sgali\OneDrive\.gemini\antigravity-ide"
) else (
    echo No se encontro la carpeta antigravity-ide original.
)
echo.

:: Procesar config
echo Procesando configuraciones (config)...
if exist "C:\Users\sgali\.gemini\config" (
    if not exist "C:\Users\sgali\OneDrive\.gemini\config" (
        echo Copiando archivos de configuracion...
        xcopy /E /I /H /Y "C:\Users\sgali\.gemini\config" "C:\Users\sgali\OneDrive\.gemini\config"
    )
    echo Renombrando carpeta original de configuracion...
    ren "C:\Users\sgali\.gemini\config" "config_backup"
    echo Creando enlace inteligente hacia OneDrive...
    mklink /J "C:\Users\sgali\.gemini\config" "C:\Users\sgali\OneDrive\.gemini\config"
) else (
    echo No se encontro la carpeta config original.
)
echo.

echo ==========================================================
echo ¡PROCESO COMPLETADO!
echo.
echo Los chats y configuraciones ahora estan en la nube de OneDrive.
echo Puedes borrar las carpetas '_backup' si todo funciona bien.
echo ==========================================================
echo.
pause
