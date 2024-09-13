import { Pool as PgPool, PoolClient as PgPoolClient } from 'pg';
import mysql, {
    Pool as MySqlPool,
    PoolConnection as MySqlConnection,
} from 'mysql2/promise';
import { DatabaseConfig } from '../types/DatabaseConfig';

export class Database {
    private pgPool?: PgPool;
    private mySqlPool?: MySqlPool;
    private config: DatabaseConfig;
    private connected: boolean = false;
    private closed: boolean = false; // State to track if the pool has been closed

    constructor(config: DatabaseConfig) {
        this.config = config;

        if (config.type === 'postgres') {
            this.pgPool = new PgPool({
                user: config.username,
                host: config.host,
                database: config.database,
                password: config.password,
                port: config.port,
                max: config.max || 10,
                idleTimeoutMillis: config.idleTimeoutMillis || 30000,
            });
        } else if (config.type === 'mysql') {
            this.mySqlPool = mysql.createPool({
                user: config.username,
                host: config.host,
                database: config.database,
                password: config.password,
                port: config.port,
                waitForConnections: true,
                connectionLimit: config.max || 10,
                queueLimit: 0,
            });
        }
    }

    public async initialize(): Promise<void> {
        if (this.connected) {
            console.warn('Database is already initialized.');
            return;
        }

        try {
            if (this.config.type === 'postgres' && this.pgPool) {
                const client = await this.pgPool.connect();
                client.release();
            } else if (this.config.type === 'mysql' && this.mySqlPool) {
                const connection = await this.mySqlPool.getConnection();
                connection.release();
            }

            this.connected = true;
            console.log(
                `Connected to ${this.config.type} database: ${this.config.database}`
            );
        } catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    }

    public async getClient(): Promise<PgPoolClient | MySqlConnection> {
        if (!this.connected) {
            throw new Error('Database is not initialized.');
        }

        if (this.config.type === 'postgres' && this.pgPool) {
            return this.pgPool.connect();
        } else if (this.config.type === 'mysql' && this.mySqlPool) {
            return this.mySqlPool.getConnection();
        } else {
            throw new Error(
                'Unsupported database type or pool not initialized.'
            );
        }
    }

    public async query(text: string, params: any[]): Promise<any> {
        if (this.config.logging) {
            console.log(
                `Executing query: ${text} with params: ${JSON.stringify(
                    params
                )}`
            );
        }

        if (this.config.type === 'postgres' && this.pgPool) {
            const client = (await this.getClient()) as PgPoolClient;
            try {
                const result = await client.query(text, params);
                return result;
            } finally {
                client.release();
            }
        } else if (this.config.type === 'mysql' && this.mySqlPool) {
            const connection = (await this.getClient()) as MySqlConnection;
            try {
                const [rows] = await connection.execute(text, params);
                return rows;
            } finally {
                connection.release();
            }
        } else {
            throw new Error(
                'Unsupported database type or pool not initialized.'
            );
        }
    }

    public async close(): Promise<void> {
        if (this.closed) {
            console.warn('Database connection pool is already closed.');
            return;
        }

        try {
            if (this.config.type === 'postgres' && this.pgPool) {
                await this.pgPool.end();
            } else if (this.config.type === 'mysql' && this.mySqlPool) {
                await this.mySqlPool.end();
            }
            this.closed = true; // Mark the pool as closed
            console.log(
                `Connection closed for ${this.config.type} database: ${this.config.database}`
            );
        } catch (error) {
            console.error('Error closing database connection:', error);
            throw error;
        }
    }
}
