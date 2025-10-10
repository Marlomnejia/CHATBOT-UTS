pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "📥 Clonando el repositorio..."
                git branch: 'main', url: 'https://github.com/Marlomnejia/CHATBOT-UTS.git'
            }
        }

        stage('Install dependencies') {
            steps {
                echo "📦 Instalando dependencias..."
                bat 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                echo "🧪 Ejecutando tests..."
                bat 'npm run test'
            }
        }

        stage('Prisma Migrations') {
            steps {
                echo "🧠 Aplicando migraciones de Prisma en entorno local..."
                bat 'npx prisma migrate deploy'
            }
        }

        stage('Start App') {
            steps {
                echo "🚀 Iniciando la aplicación localmente..."
                // Inicia la app en segundo plano
                bat 'start cmd /c "npm run start"'
                sleep time: 5, unit: 'SECONDS'
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
            echo "✅ Pipeline completado con éxito — sin Docker, simple y funcional 🚀"
        }
        failure {
            echo "❌ El pipeline falló. Revisa la salida de consola."
        }
    }
}
