import { DataSourceManager } from '../src/core/DataSourceManager';
import { DatabaseConfig } from '../src/types/DatabaseConfig';

describe('DataSourceManager Class Tests', () => {
    const config: DatabaseConfig = {
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'test2',
        logging: true,
    };

    const config2: DatabaseConfig = {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'testuser',
        password: 'testpassword',
        database: 'testdb2',
        logging: true,
    };

    let manager: DataSourceManager;

    beforeAll(() => {
        manager = new DataSourceManager();
        manager.addDatabase('db1', config);
        // manager.addDatabase('db2', config2);
    });

    afterAll(async () => {
        await manager.closeAll();
    });

    it('should initialize all databases', async () => {
        await expect(manager.initializeAll()).resolves.not.toThrow();
    });

    it('should execute a query on a specific database', async () => {
        const result = await manager.query('db1', 'SELECT 1', []);
        expect(result).toBeDefined();
    });

    it('should throw an error if querying a non-existent database', async () => {
        await expect(
            manager.query('nonexistent', 'SELECT 1', [])
        ).rejects.toThrow('Database with name nonexistent does not exist.');
    });

    it('should close all database connections', async () => {
        await expect(manager.closeAll()).resolves.not.toThrow();
    });
});
