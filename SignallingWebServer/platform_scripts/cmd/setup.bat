@Rem Copyright Epic Games, Inc. All Rights Reserved.
@echo off
setlocal enabledelayedexpansion

call :Init
call :ParseArgs %*

IF "%CONTINUE%"=="1" (
	call :Setup
)

goto :eof

:Init
:ParseArgs
:Setup
:SetPublicIP
:SetupTurnStun
:PrintConfig
:StartWilbur
echo The value of %%~dp0 is: %~dp0
set SETUP_SCRIPT_DIR=%~dp0
"%SETUP_SCRIPT_DIR%common.bat" %*
