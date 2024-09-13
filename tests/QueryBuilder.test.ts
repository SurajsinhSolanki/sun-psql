import { Database } from '../src/core/Database';
import { QueryBuilder } from '../src/core/QueryBuilder';
import { DatabaseConfig } from '../src/types/DatabaseConfig';

describe('QueryBuilder Class Tests', () => {
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
    let queryBuilder: QueryBuilder;

    beforeAll(async () => {
        database = new Database(config);
        await database.initialize();
        queryBuilder = new QueryBuilder(database);
    });

    afterAll(async () => {
        await database.close();
    });

    it('should build a select query', () => {
        const query = queryBuilder.select(['id', 'name']).from('users').build();
        expect(query).toBe('SELECT id, name FROM users');
    });

    it('should execute the built query', async () => {
        queryBuilder.select(['1']).from('users');
        const result = await queryBuilder.execute();
        expect(result).toBeDefined();
    });
});
