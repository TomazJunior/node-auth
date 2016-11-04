# node-auth
Simple authentication api

## Installation

```
$ git clone https://github.com/TomazJunior/node-auth.git
$ cd node-auth
$ npm i
Setup file node-auth.conf.json in order to inform mongo hostname.
```
## Requirements
Mongo installed

## Execution
```
$ node server.js
```

## Api
```
Title: Register new user
========================
URL: /user
Method: POST
Data Params: Json Object
    Example: 
    {
        email: [string],
        password: [string],
        role: [string] - possible values: "user" or "admin"
    }
Success response: Json Object
    Example:
    Code: 200
    {
      data: "user registered."
    }
Error response: Json Object
    Example:
    Code: 500
    {
      "message": "duplicate key error collection"
    }
    
    
Title: Authenticate user
========================
URL: /user/authenticate
Method: POST
Data Params: Json Object
    Example: 
    {
        email: [string],
        password: [string]
    }
Success response: Json Object
    Example:
    Code: 200
    {
      data: {token:[string]}
    }
Error response: Json Object
    Example:
    Code: 500
    {
      "message": "User not found."
    } 
    
Title: Get user profile
========================
URL: /api/user/:email
Method: GET
URL Params: 
    Required:
    email=[string]
    example: tomaz.jr@gmail.com
Success response: Json Object
    Example:
    Code: 200
    {
      "data": {
        "_id": "581bce68959ebc86a5ad0d28",
        "email": "tomaz.jr@gmail.com",
        "lastlogin": "2016-11-04T01:42:41.383Z",
        "role": "admin",
        "attemptsfailure": 1,
        "createwhen": "2016-11-03T23:55:05.414Z",
        "verified": false
      }
    }
    
```
