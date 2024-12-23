const express = require('express');
const bodyParser = require('body-parser');
const Message = require('./messages');  // Message 모델

const router = express.Router();
router.use(bodyParser.json());

// Handles GET requests to /messages
router.get('/messages', (req, res) => {
    console.log(`received request: ${req.method} ${req.url}`);

    // Query for messages in descending order by ID
    try {
        Message.messageModel.find({}, null, { sort: { '_id': -1 } }, (err, messages) => {
            let list = [];
            if (messages.length > 0) {
                messages.forEach((message) => {
                    // Check if the message has the required fields
                    if (message.category && message.place && message.amount && message.date && message.note) {
                        // Add the message to the response list
                        list.push({
                            category: message.category,
                            place: message.place,
                            amount: message.amount,
                            date: message.date,
                            note: message.note,
                            timestamp: message._id.getTimestamp()  // Adding timestamp for display
                        });
                    }
                });
            }
            res.status(200).json(list);  // Return the list of messages
        });
    } catch (error) {
        res.status(500).json(error);  // Internal server error
    }
});

// Handles POST requests to /messages
router.post('/messages', (req, res) => {
    try {
        // Create a new message document with the received data
        const { category, place, amount, date, note } = req.body;

        if (!category || !place || !amount || !date || !note) {
            // If any of the fields are missing, send a 400 error response
            return res.status(400).json({ error: "All fields (category, place, amount, date, note) are required." });
        }

        // Create a new message and save it to the database
        const newMessage = new Message.messageModel({
            category,
            place,
            amount,
            date,
            note
        });

        // Save the message to the database
        newMessage.save((err, message) => {
            if (err) {
                if (err.name === "ValidationError") {
                    console.error('Validation error: ' + err);
                    return res.status(400).json(err);  // Bad Request if validation error occurs
                } else {
                    console.error('Could not save message: ' + err);
                    return res.status(500).json(err);  // Internal Server Error
                }
            }

            // Respond with success status
            res.status(200).send('Message saved successfully');
        });
    } catch (err) {
        console.error('Error in POST request: ' + err);
        res.status(500).json(err);  // Internal server error
    }
});

module.exports = router;

