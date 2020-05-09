# FROM node:lts as builder
# WORKDIR /app

# # Copy package.json
# COPY package.json .
# RUN npm install --quiet

# COPY . .
# RUN npm run webpack


FROM node:8.13

ENV USER=nodejs
ENV USERID=6100
ENV GROUP=nodejs
ENV GROUPID=6100

# Create app directory
WORKDIR /home/$USER/app

# Install PM2
# RUN npm install pm2 --global --quiet

# Add local user for security
RUN groupadd -g $USERID $USER
RUN useradd -g $USERID -l -m -s /bin/false -u $GROUPID $GROUP
RUN chown -R $USER:$GROUP /home/$USER

USER $USER

# Copy package.json
COPY package.json .
RUN npm install --production --quiet

# Bundle app source
COPY . .
# COPY --from=builder /app/dist/bundle.js .
# COPY ./development.env .
# COPY ./production.env .
# COPY pm2.json .

# Expose port
# EXPOSE 3000

# Start Node server
# CMD ["pm2-runtime", "./pm2.json"]
CMD ["npm", "start"]