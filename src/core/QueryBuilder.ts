import { Database } from './Database';

export class QueryBuilder {
    private database: Database;
    private query: string = '';
    private params: any[] = [];
    private whereClauses: string[] = [];
    private joinClauses: string[] = [];
    private groupByClause: string = '';
    private havingClause: string = '';
    private selectedColumns: string[] = [];

    constructor(database: Database) {
        this.database = database;
    }

    /**
     * Start a SELECT query with fully qualified columns.
     *
     * @param {string[]} columns Array of columns to select with table names (e.g., ["table1.column1", "table2.column2"]).
     * @returns {this}
     */
    select(columns: string[] = ['*']): this {
        this.selectedColumns = columns;
        const formattedColumns = columns.join(', ');
        this.query = `SELECT ${formattedColumns} `;
        return this;
    }

    /**
     * Add a FROM clause to the query.
     *
     * @param {string} table The table to select from.
     * @returns {this}
     */
    from(table: string): this {
        this.query += `FROM ${table} `;
        return this;
    }

    /**
     * Add a WHERE clause to the query with optional conditions.
     * Supports multiple WHERE conditions.
     *
     * @param {string} condition The condition for the WHERE clause (e.g., "table.column = ?").
     * @param {any[]} params The parameters for the condition.
     * @returns {this}
     */
    where(condition: string, params: any[] = []): this {
        this.whereClauses.push(condition);
        this.params.push(...params);
        return this;
    }

    /**
     * Add an AND WHERE clause to the query.
     *
     * @param {string} condition The condition for the AND clause.
     * @param {any[]} params The parameters for the condition.
     * @returns {this}
     */
    andWhere(condition: string, params: any[] = []): this {
        this.whereClauses.push(`AND ${condition}`);
        this.params.push(...params);
        return this;
    }

    /**
     * Add an OR WHERE clause to the query.
     *
     * @param {string} condition The condition for the OR clause.
     * @param {any[]} params The parameters for the condition.
     * @returns {this}
     */
    orWhere(condition: string, params: any[] = []): this {
        this.whereClauses.push(`OR ${condition}`);
        this.params.push(...params);
        return this;
    }

    /**
     * Add a JOIN clause to the query.
     *
     * @param {string} table The table to join.
     * @param {string} condition The condition for the JOIN clause (e.g., "table1.id = table2.foreign_id").
     * @param {string} type The type of JOIN (INNER, LEFT, RIGHT, etc.).
     * @returns {this}
     */
    join(
        table: string,
        condition: string,
        type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' = 'INNER'
    ): this {
        this.joinClauses.push(`${type} JOIN ${table} ON ${condition}`);
        return this;
    }

    /**
     * Add an ORDER BY clause to the query.
     *
     * @param {string} column The column to order by with table name (e.g., "table.column").
     * @param {string} order The order direction ("ASC" or "DESC").
     * @returns {this}
     */
    orderBy(column: string, order: 'ASC' | 'DESC' = 'ASC'): this {
        this.query += `ORDER BY ${column} ${order} `;
        return this;
    }

    /**
     * Add a GROUP BY clause to the query.
     *
     * @param {string} column The column to group by with table name (e.g., "table.column").
     * @returns {this}
     */
    groupBy(column: string): this {
        this.groupByClause = `GROUP BY ${column} `;
        return this;
    }

    /**
     * Add a HAVING clause to the query.
     *
     * @param {string} condition The condition for the HAVING clause.
     * @param {any[]} params The parameters for the condition.
     * @returns {this}
     */
    having(condition: string, params: any[] = []): this {
        this.havingClause = `HAVING ${condition} `;
        this.params.push(...params);
        return this;
    }

    /**
     * Add a LIMIT clause to the query.
     *
     * @param {number} limit The maximum number of records to return.
     * @returns {this}
     */
    limit(limit: number): this {
        this.query += `LIMIT ${limit} `;
        return this;
    }

    /**
     * Add an OFFSET clause to the query.
     *
     * @param {number} offset The number of records to skip.
     * @returns {this}
     */
    offset(offset: number): this {
        this.query += `OFFSET ${offset} `;
        return this;
    }

    /**
     * Build the raw SQL query without executing it.
     * This will return the constructed query string.
     *
     * @returns {string} The constructed SQL query.
     */
    build(): string {
        const whereClause =
            this.whereClauses.length > 0
                ? 'WHERE ' + this.whereClauses.join(' ')
                : '';
        const joinClause = this.joinClauses.join(' ');
        const fullQuery =
            `${this.query} ${joinClause} ${whereClause} ${this.groupByClause} ${this.havingClause}`.trim();
        return fullQuery;
    }

    /**
     * Execute the constructed query.
     *
     * @returns {Promise<any[]>} The result of the query.
     */
    async execute(): Promise<any[]> {
        const rawQuery = this.build(); // Construct the final query by combining different parts

        try {
            const result = await this.database.query(rawQuery, this.params);
            return result.rows;
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }

    /**
     * Get the parameters for the query.
     *
     * @returns {any[]} The parameters for the query.
     */
    getParams(): any[] {
        return this.params;
    }
}
