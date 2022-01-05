//Required modules
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");

//Create app constant with Express
const app = express();

//Use bodyParser to read the body and parse it into a JSON object
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname)); //use static function of Express to use static folder

//Set up GET request using home route
app.get('/', function(req, res) {
  res.sendFile(__dirname + "/signup.html"); //response is to send the signup.html file
});

//Set up POST route
app.post("/", function(req, res) {

  //Get values from SignUp form
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

  //Create data object with keys that MailChimp will recognise
  var data = {
    members: [{
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
    }]
  };

  //Turn data object into a string in the JSON format using stringify() - this is what will be sent to MailChimp
  const jsonData = JSON.stringify(data);
  //URL and options for HTTPS request
  const url = "https://usX.api.mailchimp.com/3.0/lists/YOUR-LIST-ID"; //Replace X with the number that comes after "US" in your API key and use your List ID
  const options = {
    method: "POST",
    auth: "YOUR_MAILCHIMP_USERNAME: YOUR_MAILCHIMP_API_KEY" //Use your MailChimp username and password seperated by a colon to authenticate

  }

  //Set up HTTPS request saved in request const
  const request = https.request(url, options, function(response) {
    //if response code 200 was recieved, then display success page using success.html
    if (response.statusCode == 200) {
      res.sendFile(__dirname + "/success.html");
      //if not, then display "failure" page using failure.html
    } else {
      res.sendFile(__dirname + "/failure.html");
    }

    response.on("data", function(data) {
      console.log(JSON.parse(data));
    })
  })

  //Send jsonData to MailChimp server using write() on request const
  request.write(jsonData);
  request.end();

});

//Set up POST request for failure route
app.post("/failure", function(req, res) {
  res.redirect("/") //Redirects to home route
})

//Set up port to listen on a dynamic port defined by Heroku or locally port 3000
app.listen(process.env.PORT || 3000, function() {
  console.log("Server is running successfully"); //Log message if set up correctly
});
