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
