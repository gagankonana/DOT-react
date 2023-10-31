
.DEFAULT: help
help:
	@echo "make install"
	@echo "\t   Prepare and install environment, requirements"
	@echo "make run"
	@echo "\t   Run the application"


install:
	@echo "Check virtualenv (python3 -m pip install virtualenv)"
	which virtualenv
	@echo "==================================================="
	@echo "Initializing virtual environment"
	rm -rf .env
	virtualenv -p python3 --prompt="(DOT)" .env
	@echo "==================================================="
	@echo "Installing python requirements"
	./.env/bin/python -m pip install --upgrade pip
	./.env/bin/python -m pip install -r requirements.txt
	@echo "Installing react requirements"
	yarn install
	@echo "Installation succeeded"
	@echo "Don't forget to activate your virtual environment by running:"
	@echo "  $ source .env/bin/activate"
	@echo "==================================================="

local-server:
	python app/views2.py

local-browser:
	yarn start

run:
	make -j 2 local-server local-browser