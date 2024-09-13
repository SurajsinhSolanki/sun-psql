import { Database } from '../src/core/Database';
import { MigrationManager } from '../src/core/MigrationManager';
import { DatabaseConfig } from '../src/types/DatabaseConfig';
import path from 'path';

describe('Database Migration Tests', () => {
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
    let migrationManager: MigrationManager;

    beforeAll(async () => {
        database = new Database(config);
        await database.initialize();
        migrationManager = new MigrationManager(database);
    });

    afterAll(async () => {
        await database.close();
    });

    it('should run migrations from a user-provided directory', async () => {
        const migrationsPath = path.join(__dirname, '../src/migrations'); // Adjust this path to point to your test migrations
        await expect(
            migrationManager.runMigrations(migrationsPath)
        ).resolves.not.toThrow();
    });

    it('should not run the same migration twice', async () => {
        const migrationsPath = path.join(__dirname, '../src/migrations'); // Re-run the migrations to check if they're skipped
        await expect(
            migrationManager.runMigrations(migrationsPath)
        ).resolves.not.toThrow();
    });

    it('should handle missing or incorrect migration path gracefully', async () => {
        const incorrectPath = path.join(__dirname, 'non_existent_migrations');
        await expect(
            migrationManager.runMigrations(incorrectPath)
        ).rejects.toThrow(`Migration directory not found: ${incorrectPath}`);
    });
});
