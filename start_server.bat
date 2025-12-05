@echo off
title Parking Booking System System Launcher

echo ===============================
echo  Starting Parking Booking System...
echo ===============================

REM ---- START NODE BACKEND SERVER ----
echo Starting Node server.js ...
start "NODE SERVER" cmd /k "cd Server && node server.js"

REM ---- WAIT A MOMENT TO AVOID COLLISION ----
timeout /t 2 >nul

REM ---- START HTTP-SERVER FOR FRONTEND ----
echo Starting http-server for frontend...
start "HTTP-SERVER" cmd /k "http-server . -p 8080"

echo -------------------------------
echo  Both servers are now running!
echo -------------------------------
pause