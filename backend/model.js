import pool from "./database.js";

export class Note {
  static async find() {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM notes ORDER BY createdAt DESC"
      );

      // Format agar kompatibel dengan frontend yang mengharapkan format MongoDB
      return rows.map((row) => ({
        ...row,
        _id: row.id, // Tambahkan _id yang sama dengan id untuk kompatibilitas
        tags: JSON.parse(row.tags || "[]"), // Pastikan tags dalam format array
      }));
    } catch (error) {
      console.error("Error fetching notes:", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query("SELECT * FROM notes WHERE id = ?", [id]);
      if (!rows[0]) return null;

      const note = rows[0];
      return {
        ...note,
        _id: note.id,
        tags: JSON.parse(note.tags || "[]"),
      };
    } catch (error) {
      console.error(`Error finding note with id ${id}:`, error);
      throw error;
    }
  }

  static async create({ title, content, tags }) {
    try {
      const tagsJson = JSON.stringify(tags || []);
      const [result] = await pool.query(
        "INSERT INTO notes (title, content, tags) VALUES (?, ?, ?)",
        [title, content, tagsJson]
      );

      const [newNote] = await pool.query("SELECT * FROM notes WHERE id = ?", [
        result.insertId,
      ]);
      const formattedNote = {
        ...newNote[0],
        _id: newNote[0].id,
        tags: JSON.parse(newNote[0].tags || "[]"),
      };

      return formattedNote;
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  }

  static async findByIdAndUpdate(id, { title, content, tags }) {
    try {
      const tagsJson = JSON.stringify(tags || []);
      await pool.query(
        "UPDATE notes SET title = ?, content = ?, tags = ? WHERE id = ?",
        [title, content, tagsJson, id]
      );

      return this.findById(id);
    } catch (error) {
      console.error(`Error updating note with id ${id}:`, error);
      throw error;
    }
  }

  static async findByIdAndDelete(id) {
    try {
      const note = await this.findById(id);
      if (!note) return null;

      await pool.query("DELETE FROM notes WHERE id = ?", [id]);
      return note;
    } catch (error) {
      console.error(`Error deleting note with id ${id}:`, error);
      throw error;
    }
  }
}
