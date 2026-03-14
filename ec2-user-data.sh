#!/bin/bash
set -e

# Actualizar el sistema
yum update -y

# Instalar Node.js 20 y npm
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# Instalar git
yum install -y git

# Crear directorio para la app
mkdir -p /var/www/quiz
cd /var/www/quiz

# Clonar el repositorio
git clone https://github.com/SebasSuarez20/Baby_Mvp_v1.git .

# Instalar dependencias
npm install

# Crear archivo de configuración de environment (opcional, ajusta según necesites)
cat > .env << EOF
PORT=3000
NODE_ENV=production
EOF

# Instalar PM2 para mantener el servidor corriendo
npm install -g pm2

# Iniciar la aplicación con PM2
pm2 start server.js --name "quiz-app"

# Guardar configuración de PM2 para que inicie al reiniciar
pm2 startup
pm2 save

# Abrir puerto 3000 en firewall
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload

# Mostrar estado
echo "Aplicación iniciada exitosamente"
pm2 list
