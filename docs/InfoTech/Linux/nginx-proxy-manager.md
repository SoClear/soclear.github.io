# Nginx Proxy Manager

## 介绍

[![npm](https://nginxproxymanager.com/logo.svg)](https://nginxproxymanager.com/)
 Nginx Proxy Manager是带有webUI的nginx,可以在网页上设置端口转发,申请SSL证书.

## Best Practice: Use a Docker network [](https://nginxproxymanager.com/advanced-config/#best-practice-use-a-docker-network)

For those who have a few of their upstream services running in Docker on the same Docker host as NPM, here's a trick to secure things a bit better. By creating a custom Docker network, you don't need to publish ports for your upstream services to all of the Docker host's interfaces.

Create a network, ie "scoobydoo":

```bash
docker network create scoobydoo
```

Then add the following to the `docker-compose.yml` file for both NPM and any other services running on this Docker host:

```yml
networks:
  default:
    external: true
    name: scoobydoo
```

Let's look at a Portainer example:

```yml
services:

  portainer:
    image: portainer/portainer
    privileged: true
    volumes:
      - './data:/data'
      - '/var/run/docker.sock:/var/run/docker.sock'
    restart: unless-stopped

networks:
  default:
    external: true
    name: scoobydoo
```

Now in the NPM UI you can create a proxy host with `portainer` as the hostname, and port `9000` as the port. Even though this port isn't listed in the docker-compose file, it's "exposed" by the Portainer Docker image for you and not available on the Docker host outside of this Docker network. The service name is used as the hostname, so make sure your service names are unique when using the same network.

这样可以避免一直修改ufw,在npm里指定代理就行了
