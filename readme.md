To create user, import this curl request in postman: 
curl --location 'http://localhost:4000/users/register' \
--header 'Content-Type: application/json' \
--data-raw '{
      "username":"mohamed",
      "email": "mohamed.derbali@esprit.tn",
      "password": "123"
}'