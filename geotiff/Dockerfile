FROM node:latest

RUN apt-get update && \
    apt-get install -y git vim.tiny curl jq && \
    curl -L -sk -o /usr/local/bin/jq "https://github.com/stedolan/jq/releases/download/jq-1.5/jq-linux64" && \
    chmod a+x /usr/local/bin/jq


    # install the cli from git
RUN git clone -b v2.3 https://github.com/TACC-Cloud/agave-cli.git /usr/local/agave-cli && \
    chmod +x /usr/local/agave-cli/bin/*


COPY . /usr/local/ingestor

ENV PATH /usr/local/agave-cli/bin:$PATH

RUN mkdir /root/.agave
COPY ./current_store/current /root/.agave/current

WORKDIR /usr/local/ingestor
#RUN npm install
#~ is /root
#ENTRYPOINT ["sh", "-c", "ls ~/.agave"]
ENTRYPOINT ["node", "driver.js"]
