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

                // 🧹 Elimina contenedor de MySQL previo si existe
                bat 'docker rm -f chatbot-mysql || exit 0'

                // Levanta solo la base de datos
                bat "${DOCKER_COMPOSE} up -d chatbot-mysql"

                // Espera a que la DB esté lista
                sleep time: 10, unit: 'SECONDS'

                // Ejecuta migraciones Prisma dentro del contenedor Node
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
