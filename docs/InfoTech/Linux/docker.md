# docker

| 需求              | 命令                                                                                      |
|-----------------|-----------------------------------------------------------------------------------------|
| 查看正在运行的容器       | `docker ps`                                                                             |
| 查看所有容器          | `docker ps -a`                                                                          |
| 启动容器            | `docker start 容器名或容器ID`                                                                 |
| 停止容器            | `docker stop 容器名或容器ID`                                                                  |
| 重启容器            | `docker restart 容器名或容器ID`                                                               |
| 删除容器            | `docker rm 容器名或容器ID`                                                                    |
| 查看容器内部运行的进程     | `docker top 容器名或容器ID`                                                                   |
| 查看端口映射          | `docker port 容器名或容器ID`                                                                  |
| 查看日志            | `docker logs [-f] 容器名或容器ID`                                                             |
| 进入容器终端          | `docker exec -it 容器名或容器ID /bin/bash`                                                    |
| 以 root 用户进入容器终端 | `docker exec -it -u root 容器名或容器ID /bin/bash`                                            |
| 查看指定容器信息        | `docker inspect 容器名或容器ID`                                                               |
| 查看容器IP          | `docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 容器名或容器ID` |
| 搜索镜像            | `docker search 名字`                                                                      |
| 拉取镜像            | `docker pull 镜像ID或者作者/镜像名:TAG`                                                          |
| 查看镜像            | `docker images`                                                                         |
| 删除镜像            | `docker rmi 镜像ID或者作者/镜像名:TAG`                                                           |
| 创建卷             | `docker volume create 卷名`                                                               |
| 查看卷信息           | `docker volume inspect 卷名`                                                              |
| 查看所有卷           | `docker volume ls`                                                                      |
| 删除所有未使用的本地卷     | `docker volume prune`                                                                   |
| 删除卷             | `docker volume rm 卷名`                                                                   |
| 复制容器内文件到宿主机     | `docker cp 容器名或容器ID:容器内文件或文件夹路径 宿主机文件路径`                                                |
| 复制宿主机文件到容器内     | `docker cp 宿主机文件路径 容器名或容器ID:容器内文件或文件夹路径`                                                |

## docker compose

在当前文件夹新建 `docker-compose.yml` 文件，以 `file browser` 为例：

```yaml
version: "3.9"
services:
  app:
    image: "filebrowser/filebrowser:latest"
    container_name: filebrowser
    restart: unless-stopped
    volumes:
      - data:/srv
volumes:
  data:
networks:
  default:
    external: true
    name: scoobydoo
```

这样就创建了一个名为 `filebrowser` ，在`scoobydoo` 网络下，卷 `filebrowser_data` 映射到容器内目录 `/srv` 的容器。

接下来，在当前目录下执行 `docker compose up -d` ，便会拉取镜像，并运行容器。