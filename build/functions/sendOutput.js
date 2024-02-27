"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOutput = void 0;
function sendOutput(rootObj, exp) {
    exp.get('/', (req, res) => {
        if (rootObj) {
            res.json(rootObj);
        }
        else {
            res.status(500).json({ error: 'Data not fetched yet' });
        }
    });
    console.log("output sent, check Postman. GET at http://localhost:3000");
}
exports.sendOutput = sendOutput;
