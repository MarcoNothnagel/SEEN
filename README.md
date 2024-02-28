Current testing coverage:

-----------------|---------|----------|---------|---------|------------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s      
-----------------|---------|----------|---------|---------|------------------------
All files        |   62.73 |    67.14 |   58.09 |   67.28 |                        
 build           |   66.66 |    72.88 |   67.85 |   72.43 |                        
  api1.js        |   65.43 |    69.64 |      64 |   71.23 | 3,5-6,25-48,99,103,152 
  api2.js        |   67.77 |     75.8 |   70.96 |   73.49 | 3,5-6,25-47,78,154     
 build/functions |   27.77 |     40.9 |    7.14 |   34.48 |                        
  fetchData.js   |   26.92 |       50 |    9.09 |      35 | 3-8,18-36              
  sendOutput.js  |      30 |        0 |       0 |   33.33 | 5-13,22                
 src             |   71.53 |    69.69 |   73.33 |   73.38 |                        
  api1.ts        |   70.76 |    66.66 |   69.23 |   72.41 | 18-44,96,100           
  api2.ts        |   72.22 |    72.72 |   76.47 |   74.24 | 18-42,75
 src/functions   |   33.33 |        0 |       0 |   26.66 | 
  fetchData.ts   |   22.22 |      100 |       0 |      25 | 5-23
  sendOutput.ts  |   41.66 |        0 |       0 |   28.57 | 4-11
-----------------|---------|----------|---------|---------|------------------------

Test Suites: 4 passed, 4 total
Tests:       48 passed, 48 total
Snapshots:   0 total
Time:        3.314 s

to generate report: `npm run test-coverage`

to run tests: `npm test`

to run API1: 
- make sure that index.ts api1.start(customerId); is uncommented and run. comment api2.start(customerId);
- `npm start`

to run API2: 
- make sure that index.ts api2.start(customerId); is uncommented and run. comment api1.start(customerId);
- `npm start`


list of dependencies (`npm list`):
seen@1.0.0 C:\Users\mnoth\OneDrive\Seen
├── @types/express@4.17.21
├── @types/jest@29.5.12
├── @types/node@20.11.19
├── axios@1.6.7
├── express@4.18.2
├── jest@29.7.0
├── ts-jest@29.1.2
└── typescript@5.3.3


for more detailed analysis of logic and additional information used please consult the documentation file (To be released Wednesday afternoon)