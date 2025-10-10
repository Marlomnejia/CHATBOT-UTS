@echo off
cd /d C:\jenkins

echo 🚀 Iniciando Jenkins...
start "" cmd /k "java -jar jenkins.war"

echo 🕒 Esperando a que Jenkins inicie (10 segundos)...
timeout /t 10 >nul

echo 🌐 Abriendo Jenkins en el navegador...
start http://localhost:8080

:: OPCIONAL: Ejecutar un pipeline automáticamente
:: Sustituye admin:TOKEN y el nombre del job si quieres usarlo
:: curl -X POST http://admin:TOKEN@localhost:8080/job/chatbot_uts_pipeline/build

echo ✅ Jenkins ha sido lanzado correctamente.
pause
