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
                bat 'npm test'
            }
        }

        stage('Deploy with PM2') {
            steps {
                bat 'pm2 delete chatbot-uts || exit 0'
                bat 'pm2 start src/app.js --name chatbot-uts'
                bat 'pm2 save'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completado correctamente 🚀'
            bat 'pm2 list'
        }
        failure {
            echo '❌ Hubo un fallo en el pipeline, revisa la consola.'
        }
    }
}
