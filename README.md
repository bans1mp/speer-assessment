Speer Assessment

For the backend framework, I used express JS, this is the best framework out there to use with node to create fast servers 
For database, i used mongodb cloud as i have experience working with mongoDB as a noSQL database and i personally find it pretty simple
For rate limiting , i used express-rate-limiter
For Token generation and authentication , I used jsonwebtoken, bcrypt for hashing passwords before storing for extra security

Now how to run the app on local environment?

* download the github repository
* create a .env file in the root and enter the following Environmental variables as per your choice - MONGO_URI , PORT , JWT_SECRET
* run "npm install" in the terminal to install all the required dependencies
* Now type "npm start" in the terminal to launch up your server on localhost

How to run tests?

* After installing the dependencies and all the steps above, just run "npm run test" in the terminal and it will run all the 14 tests, you can check the test files in app.test.js
