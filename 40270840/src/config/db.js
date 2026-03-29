import mysql from 'mysql2';


const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: '40270840',
    port: '8889',
    multipleStatements: true
});

export default pool.promise(); // export promise version for async/await