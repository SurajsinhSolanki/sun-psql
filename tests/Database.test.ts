import { Database } from '../src/core/Database';
import { DatabaseConfig } from '../src/types/DatabaseConfig';

describe('Database Class Tests', () => {
    const config: DatabaseConfig = {
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'test2',
        logging: true,
    };

    let database: Database;

    beforeAll(() => {
        database = new Database(config);
    });

    afterAll(async () => {
        await database.close();
    });

    it('should initialize the database connection', async () => {
        await expect(database.initialize()).resolves.not.toThrow();
        expect(database).toBeDefined();
    });

    it('should execute a query and log it', async () => {
        const mockQuery = 'SELECT 1';
        const mockParams: any[] = [];
        const result = await database.query(mockQuery, mockParams);
        expect(result).toBeDefined();
    });

    it('should close the database connection', async () => {
        await expect(database.close()).resolves.not.toThrow();
    });
});
