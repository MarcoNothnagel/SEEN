import { Main } from '../api2';
import * as transactionInterfaces from '../interfaces/transactionInterfaces';
import * as api2Interfaces from '../interfaces/api2Interfaces';
// import { sendOutput } from '../functions/sendOutput';
// import { fetchData } from '../functions/fetchData';

const main = new Main(3000);

describe('Main', () => {

    // tests for start()
    // TODO. struggling with getting the mock functions to work

    // tests for getP2PTransactions()

    test('handle empty transactions', async () => {
        const filteredTransactions: transactionInterfaces.Transaction[] = [];
        const expectedP2PArray: api2Interfaces.P2PData[] = [];
        const actualP2PArray = await main.getP2PTransactions(filteredTransactions);

        expect(actualP2PArray).toEqual(expectedP2PArray);
    });


    test('return an empty array for no P2P transactions', async () => {
        const filteredTransactions: transactionInterfaces.Transaction[] = [
            { 
                transactionId: 1,
                authorizationCode: '',
                transactionDate: '2022-09-01T11:46:42+00:00',
                customerId: 1,
                transactionType: 'ACH_INCOMING',
                transactionStatus: '',
                description: '',
                amount: 40,
                metadata: {}
            },
            { 
                transactionId: 2,
                authorizationCode: '',
                transactionDate: '2022-10-01T11:46:42+00:00',
                customerId: 2,
                transactionType: 'WIRE_INCOMING',
                transactionStatus: '',
                description: '',
                amount: 100,
                metadata: {}
            }
        ];

        const expectedP2PArray: api2Interfaces.P2PData[] = [];
        const actualP2PArray = await main.getP2PTransactions(filteredTransactions);

        expect(actualP2PArray).toEqual(expectedP2PArray);
    });
    

    test('extract P2P transactions from filtered transactions', async () => {
        const filteredTransactions: transactionInterfaces.Transaction[] = [
            { 
                transactionId: 1,
                authorizationCode: '',
                transactionDate: '2022-09-01T11:46:42+00:00',
                customerId: 1,
                transactionType: 'ACH_INCOMING',
                transactionStatus: '',
                description: '',
                amount: 40,
                metadata: {}
            },
            { 
                transactionId: 2,
                authorizationCode: '',
                transactionDate: '2022-10-01T11:46:42+00:00',
                customerId: 2,
                transactionType: 'P2P_SEND',
                transactionStatus: '',
                description: '',
                amount: 100,
                metadata: {}
            },
            { 
                transactionId: 3,
                authorizationCode: '',
                transactionDate: '2022-11-01T11:46:42+00:00',
                customerId: 3,
                transactionType: 'P2P_RECEIVE',
                transactionStatus: '',
                description: '',
                amount: -50,
                metadata: {}
            }
        ];

        const expectedP2PArray = [
            { transactionType: 'P2P_SEND', transactionDate: '2022-10-01T11:46:42+00:00', transactionAmount: 100 },
            { transactionType: 'P2P_RECEIVE', transactionDate: '2022-11-01T11:46:42+00:00', transactionAmount: -50 },
        ];

        const actualP2PArray = await main.getP2PTransactions(filteredTransactions);

        expect(actualP2PArray).toEqual(expectedP2PArray);
    });


    // tests for findP2PLink()

    test('handle no matching P2P links', async () => {
        const allTransactions: transactionInterfaces.Transaction[] = [
            { 
                transactionId: 1,
                authorizationCode: '',
                transactionDate: '2022-09-01T11:46:42+00:00',
                customerId: 1,
                transactionType: 'P2P_SEND',
                transactionStatus: '',
                description: '',
                amount: 50,
                metadata: {}
            }
        ];
        const p2PArray: api2Interfaces.P2PData[] = [
            { transactionType: 'P2P_RECEIVE', transactionDate: '2023-11-20', transactionAmount: 100 },
        ];

        const expectedP2PLinkCustomers: api2Interfaces.RelatedCustomer[] = [];

        const actualP2PLinkCustomers = await main.findP2PLink(allTransactions, p2PArray);

        expect(actualP2PLinkCustomers).toEqual(expectedP2PLinkCustomers);
    });

    test('handle empty transactions', async () => {
        const allTransactions: transactionInterfaces.Transaction[] = [];
        const p2PArray: api2Interfaces.P2PData[] = [];
        const expectedP2PLinkCustomers: api2Interfaces.RelatedCustomer[] = [];
        const actualP2PLinkCustomers = await main.findP2PLink(allTransactions, p2PArray);
    
        expect(actualP2PLinkCustomers).toEqual(expectedP2PLinkCustomers);
      });

    test('find P2P links in transactions matching P2P data', async () => {
        const allTransactions: transactionInterfaces.Transaction[] = [
            { 
                transactionId: 2,
                authorizationCode: '',
                transactionDate: '2022-09-01T11:46:42+00:00',
                customerId: 2,
                transactionType: 'P2P_SEND',
                transactionStatus: '',
                description: '',
                amount: 100,
                metadata: {}
            },
            { 
                transactionId: 3,
                authorizationCode: '',
                transactionDate: '2022-09-01T11:46:42+00:00',
                customerId: 3,
                transactionType: 'P2P_RECEIVE',
                transactionStatus: '',
                description: '',
                amount: -100,
                metadata: {}
            },
            { 
                transactionId: 4,
                authorizationCode: '',
                transactionDate: '2023-09-01T11:46:42+00:00',
                customerId: 4,
                transactionType: 'ACH_INCOMING',
                transactionStatus: '',
                description: '',
                amount: 50,
                metadata: {}
            }
        ];

        const p2PArray: api2Interfaces.P2PData[] = [
        {
            transactionType: 'P2P_RECEIVE',
            transactionDate: '2022-09-01T11:46:42+00:00',
            transactionAmount: 100,
        },
        ];
    
        const expectedP2PLinkCustomers = [
            { relatedCustomerId: 2, relationType: 'P2P_SEND' }
        ];
    
        const actualP2PLinkCustomers = await main.findP2PLink(allTransactions, p2PArray);
    
        expect(actualP2PLinkCustomers).toEqual(expectedP2PLinkCustomers);
      });


    // tests for getDevices()

    test('handle empty transactions', async () => {
        const filteredTransactions: transactionInterfaces.Transaction[] = [];   
        const expectedDevices: string[] = [];
        const actualDevices = await main.getDevices(filteredTransactions);
    
        expect(actualDevices).toEqual(expectedDevices);
      });


    test('return an empty array for no transaction metadata', async () => {
        const filteredTransactions: transactionInterfaces.Transaction[] = [
        { 
            transactionId: 1,
            authorizationCode: '',
            transactionDate: '',
            customerId: 1,
            transactionType: '',
            transactionStatus: '',
            description: '',
            amount: 1,
            metadata: {}
        },
        { 
            transactionId: 2,
            authorizationCode: '',
            transactionDate: '',
            customerId: 2,
            transactionType: '',
            transactionStatus: '',
            description: '',
            amount: 1,
            metadata: {}
        }
        ];
    
        const expectedDevices: string[] = [];
        const actualDevices = await main.getDevices(filteredTransactions);
    
        expect(actualDevices).toEqual(expectedDevices);
      });


    test('extract unique device IDs from transactions', async () => {
        const filteredTransactions: transactionInterfaces.Transaction[] = [
            { 
                transactionId: 1,
                authorizationCode: '',
                transactionDate: '',
                customerId: 1,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device1' }
            },
            { 
                transactionId: 2,
                authorizationCode: '',
                transactionDate: '',
                customerId: 2,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device2' }
            },
            { 
                transactionId: 3,
                authorizationCode: '',
                transactionDate: '',
                customerId: 3,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device1' }
            },
            { 
                transactionId: 4,
                authorizationCode: '',
                transactionDate: '',
                customerId: 4,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device3' }
            }
        ];

        const expectedDevices = ['device1', 'device2', 'device3'];
        const actualDevices = await main.getDevices(filteredTransactions);
    
        expect(actualDevices).toEqual(expectedDevices);
      });


    // tests for findDeviceLink()

    test('find related customer IDs from transactions with matching devices', async () => {
        const allTransactions: transactionInterfaces.Transaction[] = [
            { 
                transactionId: 1,
                authorizationCode: '',
                transactionDate: '',
                customerId: 1,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device1' }
            },
            { 
                transactionId: 2,
                authorizationCode: '',
                transactionDate: '',
                customerId: 2,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device2' }
            },
            { 
                transactionId: 3,
                authorizationCode: '',
                transactionDate: '',
                customerId: 3,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device1' }
            }
        ];

        const deviceArray = ['device1'];
        const excludeId = 1;
        const expectedRelatedIDs = [3];
        const actualRelatedIDs = await main.findDeviceLink(allTransactions, deviceArray, excludeId);
    
        expect(actualRelatedIDs).toEqual(expectedRelatedIDs);
    });


    test('should return an empty array for no matching devices', async () => {
        const allTransactions: transactionInterfaces.Transaction[] = [
            { 
                transactionId: 1,
                authorizationCode: '',
                transactionDate: '',
                customerId: 1,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device1' }
            },
            { 
                transactionId: 2,
                authorizationCode: '',
                transactionDate: '',
                customerId: 2,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device2' }
            },
            { 
                transactionId: 3,
                authorizationCode: '',
                transactionDate: '',
                customerId: 3,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device3' }
            }
        ];

        const deviceArray = ['device4'];
        const excludeId = 1;
        const expectedRelatedIDs: number[] = [];
        const actualRelatedIDs = await main.findDeviceLink(allTransactions, deviceArray, excludeId);
    
        expect(actualRelatedIDs).toEqual(expectedRelatedIDs);
    });


    test('should handle empty transactions data', async () => {
        const allTransactions: transactionInterfaces.Transaction[] = [];
        const deviceArray = ['device1'];
        const excludeId = 1;
    
        const relatedIDs = await main.findDeviceLink(allTransactions, deviceArray, excludeId);
    
        expect(relatedIDs).toEqual([]);
    });


    // tests for buildRelatedCustomers()

    test('build related customers with device and transaction links', async () => {
        const deviceLinkCustomers = [1, 2, 3];
        const transactionLinkCustomers: api2Interfaces.RelatedCustomer[] = [
            { relatedCustomerId: 4, relationType: 'TRANSACTION' },
            { relatedCustomerId: 5, relationType: 'TRANSACTION' },
        ];

        const expectedRelatedCustomers: api2Interfaces.RootObject = {
            relatedTransactions: [
            { relatedCustomerId: 4, relationType: 'TRANSACTION' },
            { relatedCustomerId: 5, relationType: 'TRANSACTION' },
            { relatedCustomerId: 1, relationType: 'DEVICE' },
            { relatedCustomerId: 2, relationType: 'DEVICE' },
            { relatedCustomerId: 3, relationType: 'DEVICE' },
            ],
        };

        const actualRelatedCustomers = await main.buildRelatedCustomers(deviceLinkCustomers, transactionLinkCustomers);

        expect(actualRelatedCustomers).toEqual(expectedRelatedCustomers);
        });
    

    test('return an empty object for empty input', async () => {
        const deviceLinkCustomers: number[] = [];
        const transactionLinkCustomers: api2Interfaces.RelatedCustomer[] = [];
        const expectedRelatedCustomers: api2Interfaces.RootObject = {
            relatedTransactions: []
        };

        const actualRelatedCustomers = await main.buildRelatedCustomers(deviceLinkCustomers, transactionLinkCustomers);

        expect(actualRelatedCustomers).toEqual(expectedRelatedCustomers);
    });
    
});

