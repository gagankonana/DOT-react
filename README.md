# Welcome to DOT application
This README documentation covers installing and running the application


## Setup
#### DE does not need docker or other third-party programs to work.
1) Install Python (3.*)
2) Run `make install`. This command will create a virtual env for this project, 
install dependencies

   If `make install` does not work for you, please try the following command instead:  
   `virtualenv .env`  
   `source .env/bin/activate`  
   `pip install --upgrade pip`  
   `pip install -r requirements.txt`
3) Activate the virtual environment: `$ source .env/bin/activate`


## Run
> Don't forget to activate your python virtual environment with `$ source .env/bin/activate` before running the commands below.

To run the application:
bash
make run
