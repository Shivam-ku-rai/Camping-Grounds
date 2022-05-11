pipeline{
    agent any
    
    environment {
        registry = "shivam2021123/camping-arena"
        registryCredential = 'dockerid'
        dockerImage = 'shivam2021123/camping-arena:latest'
    }
    
    stages {
        stage('Git clone') {
            steps {
                git url: 'https://github.com/Shivam-ku-rai/Camping-Grounds.git', branch: 'main'
                // credentialsId: 'Github_token_for_major'
            }
        }
        stage('Install dependency') {
            steps {
                sh 'npm install'
            }
        }
        stage('Docker Build') {
            steps {
                sh 'docker build -t shivam2021123/camping-arena .'
            }
        }
        stage('Docker Push') {
            steps {
                script{
                    withCredentials([string(credentialsId:'dockerpass',variable:'shivam')]){
                        sh 'docker login -u shivam2021123 -p ${shivam}'
                        sh 'docker push shivam2021123/camping-arena:latest'
                    }
                    
                }
            }
        }
        stage('Clean Docker Images') {
            steps {
                sh 'docker rmi -f camping-arena'
            }
        }
        stage('Ansible Deploy') {
             steps {
                  ansiblePlaybook colorized: true, disableHostKeyChecking: true, installation: 'Ansible', inventory: 'inventory', playbook: 'deploy.yml'
             }
        }
    }
}