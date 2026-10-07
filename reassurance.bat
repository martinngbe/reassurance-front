@echo off

docker login
docker tag reassurance-front:0.0.1  ngbemartin/reassurance-front:0.0.1
docker pushngbemartin/reassurance-front:0.0.1

pause