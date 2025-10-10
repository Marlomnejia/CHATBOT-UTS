pipeline {
    agent any

    environment {
        DOCKER_COMPOSE = 'docker-compose'
    }

    stages {

        stage('Preparar Workspace') {
            steps {
                echo "🧹 Limpiando workspace y contenedores antiguos..."
                bat "${env.DOCKER_COMPOSE} down --volumes --remove-orphans || echo 'No hay contenedores que eliminar'"
            }
        }

        stage('Checkout SCM') {
            steps {
                echo "🔄 Clonando repositorio..."
                git url: 'https://github.com/Marlomnejia/CHATBOT-UTS.git', branch: 'main'
            }
        }

        stage('Instalar Herramientas') {
            steps {
                echo "⚙️ Instalando dependencias de Node..."
                bat 'npm install'
            }
        }

        stage('Construir Docker') {
            steps {
                echo "🚀 Construyendo imágenes Docker..."
                bat "${env.DOCKER_COMPOSE} build --no-cache"
            }
        }

        stage('Levantar contenedores') {
            steps {
                echo "📦 Levantando contenedores..."
                bat "${env.DOCKER_COMPOSE} up -d"
            }
        }

        stage('Ejecutar Tests') {
            steps {
                echo "🧪 Ejecutando tests..."
                bat 'npm test'
            }
        }
    }

    post {
        always {
            echo "🧹 Limpiando contenedores y red..."
            bat "${env.DOCKER_COMPOSE} down --volumes --remove-orphans || echo 'No hay contenedores que eliminar'"
        }
        success {
            echo "✅ Pipeline completado correctamente."
        }
        failure {
            echo "❌ Pipeline falló. Revisa los logs."
        }
    }
}
