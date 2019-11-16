module.exports = () => {
   return {
       "Hospital":{
           "Hospital_auth":{
               "signup":{
                   "method": "POST",
                   "URL": "http://localhost:3001/api/hospital/signup"
               },
               "signin": {
                   "method": "POST",
                   "URL": "http://localhost:3001/api/hospital/signin"
               },
               "emailVerify": {
                   "method": "GET",
                   "URL": "http://localhost:3001/api/hospital/emailVerify?token=xyz.abc.pqr"
               },
           },
           "Hospital_profile":{
               "createProfile": {
                   "method": "PUT",
                   "URL": "http://localhost:3001/api/hospital/profile",
                   "header":{
                       "x-auth-token":"token_value"
                   }
               },
               "getProfile": {
                   "method": "GET",
                   "URL": "http://localhost:3001/api/hospital/profile/:id"
               },
               "updateProfile": {
                   "method": "PUT",
                   "URL": "http://localhost:3001/api/hospital/profile/:id",
                   "header": {
                       "x-auth-token": "token_value"
                   }
               }
           }
       }
   }
};