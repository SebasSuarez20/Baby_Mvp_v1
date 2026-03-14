# Revelación de Género - Adrián & Francy

Aplicación web serverless para la revelación de género del bebé, con participación de amigos y familia. Incluye formulario de predicción, subida de archivos a AWS S3 y galería en vivo.

## Características

- Formulario de participación con selección de equipo (azul/rosa)
- Subida de fotos/videos a AWS S3
- Galería de participaciones en tiempo real
- Estadísticas en vivo
- Diseño moderno con glassmorphism
- Responsive para móviles
- Serverless en Vercel

## Despliegue en Vercel

1. Sube el código a un repo en GitHub
2. Conecta el repo a Vercel (vercel.com)
3. Configura variables de entorno en Vercel:
   - `AWS_ACCESS_KEY_ID`: Tu key de AWS
   - `AWS_SECRET_ACCESS_KEY`: Tu secret
   - `S3_BUCKET_NAME`: Nombre de tu bucket S3
4. Despliega automáticamente

## Tecnologías

- Vercel (serverless functions)
- AWS S3 para archivos
- Bootstrap + CSS personalizado
- JavaScript vanilla