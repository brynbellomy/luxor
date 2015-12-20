

all: init build

init: ./node_modules

./node_modules:
		npm install

build:
		cd ./ts && tsc

clean:
		rm -rf ./js
