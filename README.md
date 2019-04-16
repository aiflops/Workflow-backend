# WorkFlow-backend
To run: <br> 1. `npm i` to init project and libs  <br> 2.`npm start` in the cmd. It will run on port 8080

## Technologies 
Node.js,
Express.js,
Sequalize,
Mysql

## Interesting implementations:
Implemented own Authorization<br>
Implemented messeges on email<br>
Implemented rest APi for front end<br>
Implemented worker permissions and boss permissions <br>

## Docs for REST functions:



#### POST: {url}/exit/create
create exit, overtime and sends email to boss
###### params
{ date,timeStart, duration, topic, desc, idUser, overTimeDate, timeStartOverTime}
