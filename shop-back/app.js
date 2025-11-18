const express = require('express');

const app = express();
const PORT = 5000;

app.get('/users-list', (req, res) => {
    console.log('list request')
    // Get complete list of users
    const usersList = [];

    // Send the usersList as a response to the client
    res.send(usersList);
});

app.post('/users-list', (req, res) => {
    console.log('list request')
    // Get complete list of users
    const usersList = [];

    // Send the usersList as a response to the client
    res.send(usersList);
});

app.listen(PORT, (error) => {
    if (!error)
        console.log("Server is Successfully Running, and App is listening on port " + PORT);
    else
        console.log("Error occurred, server can't start", error);
}
);