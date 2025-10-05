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
                echo "🚀 Lanzando la aplicación..."
                bat 'start cmd /c "npm run start"'
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
