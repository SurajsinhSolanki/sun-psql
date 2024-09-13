import fs from 'fs';
import path from 'path';
import crypto from 'crypto'; // To calculate checksums for detecting changes
import { Database } from './Database';

export class MigrationManager {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    /**
     * Ensure the databasechangelog table exists.
     */
    private async ensureChangelogTable(): Promise<void> {
        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS databasechangelog (
        id VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        filename VARCHAR(255) NOT NULL,
        checksum VARCHAR(64) NOT NULL,
        dateexecuted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        orderexecuted INT NOT NULL,
        exectype VARCHAR(10) NOT NULL,
        PRIMARY KEY (id, author)
      );
    `;
        await this.db.query(createTableQuery, []);
    }

    /**
     * Run migrations provided by the user from a specified directory.
     * @param {string} migrationsPath The path to the migration files directory.
     */
    public async runMigrations(migrationsPath: string): Promise<void> {
        try {
            await this.ensureChangelogTable();

            if (!fs.existsSync(migrationsPath)) {
                throw new Error(
                    `Migration directory not found: ${migrationsPath}`
                );
            }

            // Read and sort migration files by filename or timestamp
            const migrationFiles = fs.readdirSync(migrationsPath).sort();

            for (const file of migrationFiles) {
                const migrationPath = path.join(migrationsPath, file);
                const migration = require(migrationPath).default;

                // Calculate checksum of the current migration script
                const currentChecksum = this.calculateChecksum(migrationPath);

                // Check if migration has already been executed
                const isExecuted = await this.isMigrationExecuted(
                    migration.id,
                    migration.author
                );

                if (isExecuted) {
                    // Ensure no changes have been made to an already executed migration
                    const recordedChecksum = await this.getMigrationChecksum(
                        migration.id,
                        migration.author
                    );
                    if (recordedChecksum !== currentChecksum) {
                        throw new Error(
                            `Migration file "${file}" has been modified after execution. Execution stopped.`
                        );
                    }
                    console.log(`Migration ${file} has already been applied.`);
                    continue;
                }

                // Apply the migration
                try {
                    const migrationQuery = await migration.up();
                    await this.db.query(migrationQuery, []);
                    console.log(`Migration ${file} applied successfully.`);

                    // Record the migration details
                    await this.recordMigration(
                        migration.id,
                        migration.author,
                        migration.description,
                        file,
                        currentChecksum
                    );
                } catch (err: any) {
                    console.error(
                        `Error executing migration ${file}:`,
                        err.message
                    );
                    throw new Error(
                        `Execution stopped at migration ${file} due to an error.`
                    );
                }
            }
        } catch (error: any) {
            console.error('Error running migrations:', error.message);
            throw error;
        }
    }

    /**
     * Check if a migration has already been executed.
     * @param {string} id The migration ID.
     * @param {string} author The author of the migration.
     * @returns {Promise<boolean>} True if the migration has been executed, otherwise false.
     */
    private async isMigrationExecuted(
        id: string,
        author: string
    ): Promise<boolean> {
        const checkQuery = `SELECT COUNT(*) FROM databasechangelog WHERE id = $1 AND author = $2`;
        const result = await this.db.query(checkQuery, [id, author]);
        return result.rows[0].count > 0;
    }

    /**
     * Get the checksum of a previously executed migration.
     * @param {string} id The migration ID.
     * @param {string} author The author of the migration.
     * @returns {Promise<string>} The recorded checksum.
     */
    private async getMigrationChecksum(
        id: string,
        author: string
    ): Promise<string> {
        const checkQuery = `SELECT checksum FROM databasechangelog WHERE id = $1 AND author = $2`;
        const result = await this.db.query(checkQuery, [id, author]);
        return result.rows[0]?.checksum || '';
    }

    /**
     * Record a migration as executed.
     * @param {string} id The migration ID.
     * @param {string} author The author of the migration.
     * @param {string} description A brief description of the migration.
     * @param {string} filename The migration file name.
     * @param {string} checksum The checksum of the migration file.
     */
    private async recordMigration(
        id: string,
        author: string,
        description: string,
        filename: string,
        checksum: string
    ): Promise<void> {
        const insertQuery = `
      INSERT INTO databasechangelog (id, author, description, filename, checksum, orderexecuted, exectype)
      VALUES ($1, $2, $3, $4, $5, (SELECT COALESCE(MAX(orderexecuted), 0) + 1 FROM databasechangelog), 'EXECUTED')
    `;
        await this.db.query(insertQuery, [
            id,
            author,
            description,
            filename,
            checksum,
        ]);
    }

    /**
     * Calculate a checksum for a file to detect changes.
     * @param {string} filePath The path to the file.
     * @returns {string} The calculated checksum.
     */
    private calculateChecksum(filePath: string): string {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return crypto.createHash('sha256').update(fileContent).digest('hex');
    }
}
