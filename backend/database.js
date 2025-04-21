import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "notes_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const connectToDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL");
    connection.release();
  } catch (error) {
    console.error("MySQL connection error:", error);
    process.exit(1);
  }
};

export default pool;
