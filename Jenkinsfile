pipeline {
    agent any

    tools {
        nodejs "NodeJS"
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

        stage('Test') {
            steps {
                bat 'npm run test'
            }
        }

        stage('Deploy') {
            steps {
                echo "🚀 Lanzando la aplicación localmente..."
                bat 'start cmd /c "npm run start"'
                sleep time: 5, unit: 'SECONDS'
                echo "✅ Aplicación levantada localmente"
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
            echo "✅ Pipeline completado con éxito"
        }
        failure {
            echo "❌ El pipeline falló. Revisa la salida de consola."
        }
    }
}
