export default {
    id: '202409130002', // Unique identifier, can be a timestamp or any unique string
    author: 'John Doe',
    description: 'add created_at column',
    timestamp: new Date().toISOString(), // Timestamp when the migration is created

    /**
     * The `up` method contains the SQL statements to apply the migration.
     */
    up: async () => {
        return `
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
      `;
    },

    /**
     * The `down` method contains the SQL statements to revert the migration.
     * This now only removes the `created_at` column.
     */
    down: async () => {
        return `
        ALTER TABLE users DROP COLUMN IF EXISTS created_at;
      `;
    },
};
