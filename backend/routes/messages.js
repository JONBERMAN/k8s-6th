const mongoose = require('mongoose');

const GUESTBOOK_DB_ADDR = process.env.GUESTBOOK_DB_ADDR;
const mongoURI = "mongodb://" + GUESTBOOK_DB_ADDR + "/guestbook";

const db = mongoose.connection;

// Handle database events
db.on('disconnected', () => {
    console.error(`Disconnected: unable to reconnect to ${mongoURI}`);
    throw new Error(`Disconnected: unable to reconnect to ${mongoURI}`);
});

db.on('error', (err) => {
    console.error(`Unable to connect to ${mongoURI}: ${err}`);
});

db.once('open', () => {
    console.log(`Connected to ${mongoURI}`);
});

// Connect to MongoDB
const connectToMongoDB = async () => {
    await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        connectTimeoutMS: 2000,
        reconnectTries: 1
    });
};

// Message Schema with the updated fields
const messageSchema = mongoose.Schema({
    category: { type: String, required: [true, 'Category is required'] },
    place: { type: String, required: [true, 'Place is required'] },
    amount: { type: Number, required: [true, 'Amount is required'] },
    date: { type: Date, required: [true, 'Date is required'] },
    note: { type: String, required: [true, 'Note is required'] },
}, { timestamps: true });  // Automatically includes createdAt and updatedAt fields

// Message model
const messageModel = mongoose.model('Message', messageSchema);

// Construct a new message object
const construct = (params) => {
    const { category, place, amount, date, note } = params;
    const message = new messageModel({ category, place, amount, date, note });
    return message;
};

// Save the constructed message to the database
const save = (message) => {
    console.log("Saving message...");
    message.save((err) => {
        if (err) {
            console.error("Error saving message:", err);
            throw err;
        }
        console.log("Message saved successfully.");
    });
};

// Create a new message, validate and save
const create = (params) => {
    try {
        const msg = construct(params);
        const validationError = msg.validateSync();  // Validate message data
        if (validationError) {
            throw validationError;  // Throw validation error if any field is invalid
        }
        save(msg);  // Save the message if valid
    } catch (error) {
        throw error;  // If validation or saving fails, throw error
    }
};

module.exports = {
    create: create,
    messageModel: messageModel,
    connectToMongoDB: connectToMongoDB
};

