import express, {Application, Request, Response} from 'express';

export function sendOutput(rootObj: any, exp: Application): void {
    exp.get('/', (req: Request, res: Response) => { // use express as framework to send data
        if (rootObj) {
            res.json(rootObj); // send the rootObj as the final output to localhost
        } else {
            res.status(500).json({ error: 'Data not fetched yet or there is another error' }); // throw an error if the data is not fetched yet or something else
        }
    });
    console.log("output sent, check Postman. GET at http://localhost:3000"); // just a little output message for showing what HTTP should be used in Postman
}