@echo off
SETLOCAL
set CONFIG_PORT="server.port=8181"
set CONFIG_URL="mongo.url=localhost"
set CONFIG_DB="mongo.dbname=storage"
set JAVA_CMD="C:\Program Files\Java\jdk1.7.0_21\bin\java"
set APP_HOME="."

IF "%1" == "start" (
	echo Starting Image Cache Server
	start "Image Cache Server" /B %JAVA_CMD% -jar %APP_HOME%/image-cache-server.jar %CONFIG_PORT% %CONFIG_URL% %CONFIG_DB%
	echo Image Cache Server Started. 
	for /F "TOKENS=1,2,*" %%a in ('tasklist /FI "IMAGENAME eq java.exe"') do echo %%b > %APP_HOME%/app.pid
	GOTO END
)

IF "%1" == "stop" (
	echo "Stopping Image Cache Server..."
	for /f "delims=" %%x in (app.pid) do taskkill /F /PID %%x
	GOTO END
)

echo "Commands start|stop"

:END
ENDLOCAL