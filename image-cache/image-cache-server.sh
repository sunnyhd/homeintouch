#!/bin/bash
CONFIG="server.port=8181 mongo.url=localhost mongo.dbname=storage"
JAVA_CMD=/opt/tools/java/jdk1.7.0_17/bin/java
APP_HOME=`dirname $0`
APP_PID=$APP_HOME/image-cache-server.pid

COMMAND=$1
echo "EL COMANDO ELEGIDO ES $COMMAND"

case $COMMAND in
	"start")
		echo "Starting Image Cache Server"
		$JAVA_CMD -jar $APP_HOME/image-cache-server.jar $CONFIG &> $APP_HOME/logs/image-cache-server.log &
		echo "Image Cache Server Started." 
		echo "config: $CONFIG"
		echo $! > $APP_PID  
	;;
	"stop")
		echo "Stopping Image Cache Server..."
		kill -9 `cat $APP_PID`
	;;
	*)
		echo "Usage $0 start|stop"
		exit 1
	;;
		
esac
