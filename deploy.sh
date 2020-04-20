echo "This will stop and remove ERC20 container, then remove ERC20 image and create and run new image"

echo "Stoping docker for ERC20...."
docker stop  ERC20-service

echo "Removing docker for ERC20...."
docker rm  ERC20-service

echo "Removing docker image for ERC20...."
docker image rm  ERC20-services-image:latest


echo "Building docker image for ERC20...."
docker build -t ERC20-services-image:latest .


echo "Running docker image for ERC20...."
docker run -d --name erc-service --restart=always -p 5000:5000 -e NODE_ENV=production erc-services-image:latest