import express, {Application, Request, Response} from 'express';

export function sendOutput(rootObj: any, exp: Application): void {
    exp.get('/', (req: Request, res: Response) => {
        if (rootObj) {
            res.json(rootObj);
        } else {
            res.status(500).json({ error: 'Data not fetched yet' });
        }
    });
    console.log("output sent, check Postman. GET at http://localhost:3000");
}