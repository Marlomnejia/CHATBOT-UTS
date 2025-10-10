pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    environment {
        DOCKER_COMPOSE = 'docker-compose'
        APP_CONTAINER = 'chatbot-uts'  // nombre del contenedor Node en docker-compose.yml
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Marlomnejia/CHATBOT-UTS.git'
            }
        }

        stage('Install dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npm run test'
            }
        }

        stage('Docker Build') {
            steps {
                echo "🐳 Construyendo imágenes Docker..."
                bat "${DOCKER_COMPOSE} down"
                bat "${DOCKER_COMPOSE} build"
            }
        }

        stage('Run Prisma Migrations') {
            steps {
                echo "🛠️ Ejecutando migraciones de Prisma dentro del contenedor..."

                // 🧹 Elimina contenedores previos para evitar conflictos de nombre
                bat 'docker rm -f chatbot-mysql || exit 0'
                bat 'docker rm -f chatbot-uts || exit 0'

                // 🚀 Levanta base de datos y la app en segundo plano
                bat "${DOCKER_COMPOSE} up -d chatbot-mysql chatbot-uts"

                // ⏳ Espera activa a que MySQL esté listo para aceptar conexiones
                bat '''
                echo "⏳ Esperando a que MySQL acepte conexiones..."
                for /l %%i in (1,1,20) do (
                    docker exec chatbot-mysql mysqladmin ping -h "127.0.0.1" --silent
                    IF %ERRORLEVEL% EQU 0 (
                        echo ✅ MySQL está listo.
                        exit /b 0
                    )
                    timeout /t 2 >nul
                )
                echo ❌ MySQL no se levantó a tiempo.
                exit /b 1
                '''

                // 🧠 Ahora que la DB está lista y la app corriendo, aplicamos migraciones
                bat "docker exec ${APP_CONTAINER} npx prisma migrate deploy"
            }
        }

        stage('Docker Deploy') {
            steps {
                echo "🚀 Levantando todos los contenedores..."
                bat "${DOCKER_COMPOSE} up -d"
            }
        }

        stage('Verify') {
            steps {
                echo "🔍 Verificando que la aplicación esté levantada..."
                bat '''
                curl -s http://localhost:3000 >nul
                IF %ERRORLEVEL% NEQ 0 (
                    echo ❌ La aplicación no respondió correctamente.
                    exit /b 1
                ) ELSE (
                    echo ✅ Aplicación verificada correctamente.
                )
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completado con éxito — App levantada, migraciones aplicadas y todo en Docker 🎉"
        }
        failure {
            echo "❌ El pipeline falló. Revisa la salida de consola."
        }
    }
}
