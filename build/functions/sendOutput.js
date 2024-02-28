"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOutput = void 0;
function sendOutput(rootObj, exp) {
    exp.get('/', (req, res) => {
        if (rootObj) {
            res.json(rootObj); // send the rootObj as the final output to localhost
        }
        else {
            res.status(500).json({ error: 'Data not fetched yet or there is another error' }); // throw an error if the data is not fetched yet or something else
        }
    });
    console.log("output sent, check Postman. GET at http://localhost:3000"); // just a little output message for showing what HTTP should be used in Postman
}
exports.sendOutput = sendOutput;
