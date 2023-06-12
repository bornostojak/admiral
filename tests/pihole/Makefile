SHELL:=/bin/bash
NAME:=`basename ${PWD}`
EDITOR:=/bin/vim

info: ls ps
up:
	docker stack deploy -c ${NAME}.yaml ${NAME}
down:
	docker stack rm ${NAME}
restart: 
	${MAKE} down && sleep 8 && ${MAKE} up
ls:
	docker service ls | grep ${NAME}_
ps:
	docker service ps ${NAME}_${NAME}
log:
	docker service logs ${NAME}_${NAME}
sh:
	docker exec -it `docker ps --format '{{.Names}}' --filter "name=${NAME}.*"` sh
ins:
	docker service inspect ${NAME}_${NAME} | jq . | less
pull:
	docker-compose --file ${NAME}.yaml pull
edit:
	${EDITOR} ${NAME}.yaml
init:
	touch ${NAME}.yaml
	${MAKE} edit
