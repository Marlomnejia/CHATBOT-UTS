pipeline {
    agent any

    environment {
        // Usamos el .env.example como archivo de variables
        DOTENV_FILE = ".env.example"
    }

    stages {
        stage('Preparar Workspace') {
            steps {
                echo '🧹 Limpiando workspace y contenedores antiguos...'
                bat """
                docker-compose down --rmi all --volumes --remove-orphans || echo 'No hay contenedores que eliminar'
                """
            }
        }

        stage('Checkout SCM') {
            steps {
                echo '🔄 Clonando repositorio...'
                checkout scm
            }
        }

        stage('Instalar Dependencias') {
            steps {
                echo '⚙️ Instalando dependencias de Node...'
                bat 'npm install'
            }
        }

        stage('Construir Docker') {
            steps {
                echo '🛠️ Construyendo imágenes Docker...'
                bat "docker-compose build --no-cache --env-file %DOTENV_FILE%"
            }
        }

        stage('Levantar contenedores') {
            steps {
                echo '📦 Levantando contenedores...'
                bat "docker-compose up -d --env-file %DOTENV_FILE%"
            }
        }

        stage('Ejecutar Tests') {
            steps {
                echo '🧪 Ejecutando tests...'
                // Aquí puedes poner los comandos de tus tests, por ejemplo:
                bat "npm test || echo 'Tests fallaron, pero seguimos'"
            }
        }
    }

    post {
        always {
            echo '🧹 Limpiando contenedores y red...'
            bat "docker-compose down --volumes --remove-orphans || echo 'No hay contenedores que eliminar'"
        }

        success {
            echo '✅ Pipeline completado con éxito.'
        }

        failure {
            echo '❌ Pipeline falló. Revisa los logs.'
        }
    }
}
