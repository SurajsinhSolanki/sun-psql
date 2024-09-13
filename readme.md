# Database Manager NPM Package

A comprehensive database management solution for handling multiple databases (PostgreSQL and MySQL) with advanced features like query building, migration management, and input sanitization.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Initialize Database Connection](#initialize-database-connection)
  - [Running Migrations](#running-migrations)
  - [Query Building](#query-building)
- [Writing Migration Scripts](#writing-migration-scripts)
- [Testing](#testing)
  - [Running Tests](#running-tests)
  - [Test Coverage](#test-coverage)
- [API Reference](#api-reference)
  - [Database](#database)
  - [DataSourceManager](#datasourcemanager)
  - [MigrationManager](#migrationmanager)
  - [QueryBuilder](#querybuilder)
  - [sanitize](#sanitize)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the package, run:

```bash
npm install your-package-name
```

## Usage

### Initialize Database Connection

To use the package, you first need to create a database configuration and initialize the connection:

```typescript
import { Database, DataSourceManager } from 'your-package-name';

// Create a database configuration
const config = {
    type: 'postgres', // or 'mysql'
    host: 'localhost',
    database: 'my_database',
    username: 'my_user',
    password: 'my_password',
    port: 5432, // default port for PostgreSQL
    max: 10, // maximum number of clients in the pool
    idleTimeoutMillis: 30000, // idle timeout in milliseconds
};

// Initialize a database
const database = new Database(config);

// Initialize DataSourceManager
const dataSourceManager = new DataSourceManager();
dataSourceManager.addDatabase('default', config);
await dataSourceManager.initializeAll();
```

### Running Migrations

To run migrations, you need to create a migration manager instance and specify the directory where your migration files are located:

```typescript
import { MigrationManager } from 'your-package-name';

const migrationManager = new MigrationManager(database);
await migrationManager.runMigrations('/path/to/migrations');
```

### Query Building

### Advanced QueryBuilder

The `QueryBuilder` class is a TypeScript utility designed to simplify the creation and execution of SQL queries. It provides a fluent interface to build complex SQL queries dynamically, making it easier to perform CRUD operations, filtering, and advanced querying with SQL-like syntax.

#### Features

- **Basic SQL Operations**: `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
- **Advanced SQL Operators**: `LIKE`, `NOT LIKE`, `BETWEEN`, `NOT BETWEEN`, `IN`, `NOT IN`, `EXISTS`, `NOT EXISTS`.
- **Joins**: `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `FULL JOIN`.
- **Subqueries**: Supports subqueries in `SELECT`, `WHERE`, `FROM` clauses.
- **Union Operations**: `UNION` and `UNION ALL`.
- **Pagination**: Combines `LIMIT` and `OFFSET` for pagination.
- **Common Table Expressions (CTE)**: `WITH` clause support.
- **Returning Clauses**: Supports `RETURNING` clauses for `INSERT`, `UPDATE`, `DELETE`.
- **SQL Security**: Protects against SQL injection through parameterized queries.

#### Installation

To use the `QueryBuilder` in your project, you need to have a `Database` module that provides a method for executing SQL queries.

1. Clone the repository or copy the `QueryBuilder` class to your project.

2. Install any dependencies required by your database module (e.g., `pg` for PostgreSQL, `mysql2` for MySQL).

3. Import the `QueryBuilder` class into your project.

### Usage

#### 1. Initialize `QueryBuilder`

To use the `QueryBuilder`, you need to initialize it with a `Database` instance that can execute queries:

```typescript
import { Database } from './Database';
import { QueryBuilder } from './QueryBuilder';

const database = new Database(); // Your database implementation
const queryBuilder = new QueryBuilder(database);
```

### 2. Examples

#### Select Query

```typescript
const results = await queryBuilder
    .select(['users.id', 'users.name'])
    .from('users')
    .where('users.active = ?', [true])
    .orderBy('users.name', 'ASC')
    .limit(10)
    .offset(0)
    .execute();

console.log(results);
```

#### Insert Query

```typescript
await queryBuilder
    .insertInto('users', ['name', 'email'])
    .values(['John Doe', 'john@example.com'])
    .returning(['id'])
    .execute();
```

#### Update Query

```typescript
await queryBuilder
    .update('users')
    .set('name', 'Jane Doe')
    .where('id = ?', [1])
    .execute();
```

#### Delete Query

```typescript
await queryBuilder
    .deleteFrom('users')
    .where('id = ?', [1])
    .execute();
```

#### Advanced Operators

```typescript
const results = await queryBuilder
    .select(['products.id', 'products.name'])
    .from('products')
    .where('price BETWEEN ? AND ?', [10, 50])
    .andWhere('category_id IN (?, ?)', [1, 2])
    .like('name', '%gadget%')
    .execute();
```

#### Using Joins and Subqueries

```typescript
const subQuery = new QueryBuilder(database)
    .select(['id'])
    .from('orders')
    .where('total > ?', [1000]);

const results = await queryBuilder
    .select(['customers.name', 'orders.total'])
    .from('customers')
    .join(subQuery, 'customers.id = subquery.customer_id', 'INNER')
    .execute();
```

#### Using CTEs (Common Table Expressions)

```typescript
const cteQuery = new QueryBuilder(database)
    .select(['id', 'name'])
    .from('categories')
    .where('active = ?', [true]);

const results = await queryBuilder
    .with('active_categories', cteQuery)
    .select(['products.id', 'products.name'])
    .from('products')
    .join('active_categories', 'products.category_id = active_categories.id')
    .execute();
```

### Methods

- `select(columns: string[])`: Start a `SELECT` query.
- `distinct()`: Use `DISTINCT` for unique results.
- `from(table: string | QueryBuilder)`: Specify the table or subquery for `SELECT` or other operations.
- `where(condition: string, params: any[])`: Add a `WHERE` clause.
- `andWhere(condition: string, params: any[])`: Add an `AND` condition.
- `orWhere(condition: string, params: any[])`: Add an `OR` condition.
- `like(column: string, value: string)`: Add a `LIKE` clause.
- `notLike(column: string, value: string)`: Add a `NOT LIKE` clause.
- `between(column: string, start: any, end: any)`: Add a `BETWEEN` clause.
- `notBetween(column: string, start: any, end: any)`: Add a `NOT BETWEEN` clause.
- `in(column: string, values: any[])`: Add an `IN` clause.
- `notIn(column: string, values: any[])`: Add a `NOT IN` clause.
- `exists(subquery: QueryBuilder)`: Add an `EXISTS` clause.
- `notExists(subquery: QueryBuilder)`: Add a `NOT EXISTS` clause.
- `join(table: string | QueryBuilder, condition: string, type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL')`: Add a `JOIN` clause.
- `orderBy(column: string, order: 'ASC' | 'DESC')`: Add an `ORDER BY` clause.
- `groupBy(column: string)`: Add a `GROUP BY` clause.
- `having(condition: string, params: any[])`: Add a `HAVING` clause.
- `limit(limit: number)`: Add a `LIMIT` clause.
- `offset(offset: number)`: Add an `OFFSET` clause.
- `paginate(page: number, pageSize: number)`: Paginate results.
- `insertInto(table: string, columns: string[])`: Start an `INSERT` query.
- `values(values: any[])`: Add values for the `INSERT` query.
- `update(table: string)`: Start an `UPDATE` query.
- `set(column: string, value: any)`: Set columns for `UPDATE`.
- `deleteFrom(table: string)`: Start a `DELETE` query.
- `union(query: QueryBuilder, all: boolean)`: Add a `UNION` or `UNION ALL` operation.
- `with(alias: string, subquery: QueryBuilder)`: Add a `WITH` clause for CTEs.
- `returning(columns: string[])`: Add a `RETURNING` clause.
- `build()`: Build the SQL query string.
- `execute()`: Execute the built SQL query.

### Usage Tips

- **Modular Structure**: Ensure the `Database` module is implemented properly to execute the queries.
- **Security**: The `QueryBuilder` uses parameterized queries to prevent SQL injection.
- **Extensibility**: You can extend this class to add more SQL operations or integrate it with different databases.

Feel free to customize the `README.md` file further based on your project's needs!
```

## Writing Migration Scripts

A migration script is a JavaScript file that contains SQL statements to manage schema changes in the database. Each migration script should export a default object with `id`, `author`, `description`, `up`, and optionally `down` methods.

### Example Migration Script

Create a migration script in the `migrations` directory:

```javascript
export default {
    id: '202409130001', // Unique identifier, can be a timestamp or any unique string
    author: 'John Doe',
    description: 'Create users table',
    timestamp: new Date().toISOString(), // Timestamp when the migration is created

    /**
     * The `up` method contains the SQL statements to apply the migration.
     */
    up: async () => {
        return `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL
        );
      `;
    },

    /**
     * The `down` method contains the SQL statements to revert the migration.
     * This is optional but recommended for rollback capabilities.
     */
    down: async () => {
        return `
        DROP TABLE IF EXISTS users;
      `;
    },
};
```

### Migration Script Details

- **`id`**: A unique identifier for the migration. This can be a timestamp or any unique string.
- **`author`**: The name of the person who created the migration.
- **`description`**: A short description of what the migration does.
- **`timestamp`**: The date and time when the migration was created.
- **`up`**: An asynchronous function that returns the SQL statements to apply the migration.
- **`down`**: An asynchronous function that returns the SQL statements to revert the migration. This is optional but recommended for rollback capabilities.

## Testing

### Running Tests

This package includes several test files to ensure the functionality of the different components. The tests are written using Jest.

To run the tests, execute the following command:

```bash
npm test
```

### Test Coverage

The test files cover the following components:

1. **Database Class Tests**: Tests the initialization, query execution, and closing of the database connection.
2. **DataSourceManager Class Tests**: Tests adding databases, initializing all databases, executing queries on specific databases, and closing connections.
3. **MigrationManager Class Tests**: Tests running migrations, handling duplicate migrations, and managing incorrect migration paths.
4. **QueryBuilder Class Tests**: Tests building and executing SQL queries dynamically.

## API Reference

### `Database`

Manages database connections and provides methods for executing queries.

- `new Database(config: DatabaseConfig)`: Creates a new database instance with the specified configuration.
- `initialize(): Promise<void>`: Initializes the database connection.
- `getClient(): Promise<PgPoolClient | MySqlConnection>`: Returns a client from the pool.
- `query(text: string, params: any[]): Promise<any>`: Executes a query with parameters.
- `close(): Promise<void>`: Closes the database connection pool.

### `DataSourceManager`

Manages multiple databases and allows executing queries on specific databases.

- `addDatabase(name: string, config: DatabaseConfig): void`: Adds a new database.
- `initializeAll(): Promise<void>`: Initializes all added databases.
- `getDatabase(name: string): Database | undefined`: Retrieves a database by name.
- `query(dbName: string, text: string, params: any[]): Promise<any>`: Executes a query on a specific database.
- `closeAll(): Promise<void>`: Closes all database connections.

### `MigrationManager`

Handles database migrations.

- `new MigrationManager(db: Database)`: Creates a new migration manager for the specified database.
- `runMigrations(migrationsPath: string): Promise<void>`: Runs migrations from the specified directory.

### `QueryBuilder`

Dynamically builds and executes SQL queries.

- `select(columns: string[]): this`: Specifies columns for the SELECT query.
- `from(table: string): this`: Specifies the table for the FROM clause.
- `where(condition: string, params: any[]): this`: Adds a WHERE clause.
- `join(table: string, condition: string, type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' = 'INNER'): this`: Adds a JOIN clause.
- `orderBy(column: string, order: 'ASC' | 'DESC' = 'ASC'): this`: Adds an ORDER BY clause.
- `limit(limit: number): this`: Adds a LIMIT clause.
- `offset(offset: number): this`: Adds an OFFSET clause.
- `build(): string`: Builds the raw SQL query without executing it.
- `execute(): Promise<any[]>`: Executes the constructed query.

### `sanitize`

Utility function to sanitize user input to prevent XSS attacks.

- `sanitize(input: string): string`: Returns the sanitized input.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss potential changes.

## License

This project is licensed under the MIT License.

---
