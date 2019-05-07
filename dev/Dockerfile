FROM node:10.14

# install mongodb inside the docker container
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4 && \
	echo "deb http://repo.mongodb.org/apt/debian stretch/mongodb-org/4.0 main" | tee /etc/apt/sources.list.d/mongodb-org-4.0.list && \
	apt-get update && \
	apt-get install -y mongodb-org && \
	rm -rf /var/lib/apt/lists/*

COPY package.json /app/package.json
RUN cd /app && npm install

WORKDIR /app

COPY dev/init /root/init

ENTRYPOINT /root/init && /bin/sh