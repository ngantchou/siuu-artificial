echo "This will stop and remove official container, then remove official image and create and run new image"

echo "Stoping docker for official...."
docker stop  official-service

echo "Removing docker for official...."
docker rm  official-service

echo "Removing docker image for official...."
docker image rm  official-services-image:latest


echo "Building docker image for official...."
docker build -t official-services-image:latest .


echo "Running docker image for official...."
docker run -d --name official-service --restart=always -p 4000:4000 -e NODE_ENV=production official-services-image:latest