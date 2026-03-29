@echo off
echo.
echo  ===================================
echo   Selecta - Iniciando servidor...
echo  ===================================
echo.
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:3001
echo.
echo  Credenciales: admin / selecta123
echo.
start "Selecta API" cmd /k "cd server && npm run dev"
timeout /t 2 >nul
start "Selecta App" cmd /k "cd client && npm run dev"
echo  Abriendo en 3 segundos...
timeout /t 3 >nul
start http://localhost:5173
