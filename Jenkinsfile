pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        DOCKER_COMPOSE = 'docker-compose'
        APP_URL = 'http://localhost:3000'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Clonando repositorio...'
                git branch: 'main', url: 'https://github.com/Marlomnejia/CHATBOT-UTS.git'
            }
        }

        stage('Docker Build') {
            steps {
                echo '🐳 Construyendo imágenes Docker...'
                bat "${DOCKER_COMPOSE} down"
                bat "${DOCKER_COMPOSE} build"
            }
        }

        stage('Docker Up') {
            steps {
                echo '🚀 Levantando contenedores...'
                bat "${DOCKER_COMPOSE} up -d"

                echo '⏳ Esperando a que la app responda...'
                // Espera activa hasta que el puerto 3000 responda
                bat '''
                for /l %%i in (1,1,30) do (
                    curl -s http://localhost:3000 >nul 2>&1
                    IF %ERRORLEVEL% EQU 0 (
                        echo ✅ La app está levantada.
                        exit /b 0
                    )
                    echo "⏳ Esperando que la app esté lista (intento %%i)..."
                    timeout /t 2 >nul
                )
                echo ❌ La app no respondió a tiempo.
                exit /b 1
                '''
            }
        }

        stage('Run Tests') {
            steps {
                echo '🧪 Ejecutando tests Cypress...'
                bat 'npm install' // por si Cypress está como devDependency
                bat 'npx cypress run'
            }
        }
    }

    post {
        always {
            echo '🧹 Limpiando contenedores...'
            bat "${DOCKER_COMPOSE} down"
        }
        success {
            echo "✅ Pipeline completado con éxito en entorno Docker 🎉"
        }
        failure {
            echo "❌ El pipeline falló. Revisa la salida de Jenkins."
        }
    }
}
