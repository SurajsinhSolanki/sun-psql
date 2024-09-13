import { Database } from './Database';
import { DatabaseConfig } from '../types/DatabaseConfig';

export class DataSourceManager {
    private databases: Map<string, Database> = new Map();

    public addDatabase(name: string, config: DatabaseConfig): void {
        if (this.databases.has(name)) {
            throw new Error(`Database with name ${name} already exists.`);
        }
        const database = new Database(config);
        this.databases.set(name, database);
    }

    public async initializeAll(): Promise<void> {
        for (const [name, db] of this.databases.entries()) {
            console.log(`Initializing database: ${name}`);
            await db.initialize();
        }
    }

    public getDatabase(name: string): Database | undefined {
        return this.databases.get(name);
    }

    public async query(
        dbName: string,
        text: string,
        params: any[]
    ): Promise<any> {
        const db = this.getDatabase(dbName);
        if (!db) {
            throw new Error(`Database with name ${dbName} does not exist.`);
        }
        return db.query(text, params);
    }

    public async closeAll(): Promise<void> {
        for (const [name, db] of this.databases.entries()) {
            console.log(`Closing database: ${name}`);
            await db.close();
        }
    }
}
