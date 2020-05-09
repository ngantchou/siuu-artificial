echo "This will stop and remove erc container, then remove erc image and create and run new image"

echo "Stoping docker for erc...."
docker stop  erc-service

echo "Removing docker for erc...."
docker rm  erc-service

echo "Removing docker image for erc...."
docker image rm  erc-services-image:latest


echo "Building docker image for erc...."
docker build -t erc-services-image:latest .


echo "Running docker image for erc...."
docker run -d --name erc-service --restart=always -p 5000:443 -e NODE_ENV=production erc-services-image:latest