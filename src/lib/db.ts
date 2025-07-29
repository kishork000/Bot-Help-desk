
'use server';

import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import { faqs as initialFaqs, pinCodeData as initialPinCodeData } from './data';

let db: Database | null = null;

async function initializeDatabase() {
    const newDb = await open({
      filename: './database.db',
      driver: sqlite3.Database
    });

    await newDb.exec(`
        CREATE TABLE IF NOT EXISTS faqs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS pincodes (
            pincode TEXT PRIMARY KEY,
            info TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS media (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('video', 'image', 'reel')),
            url TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS unanswered_queries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    // Seed initial data if tables are empty
    const faqsCount = await newDb.get('SELECT COUNT(*) as count FROM faqs');
    if (faqsCount.count === 0) {
        const stmt = await newDb.prepare('INSERT INTO faqs (question, answer) VALUES (?, ?)');
        for (const faq of initialFaqs) {
            await stmt.run(faq.question, faq.answer);
        }
        await stmt.finalize();
    }

    const pincodesCount = await newDb.get('SELECT COUNT(*) as count FROM pincodes');
    if (pincodesCount.count === 0) {
        const stmt = await newDb.prepare('INSERT INTO pincodes (pincode, info) VALUES (?, ?)');
        for (const [pincode, info] of Object.entries(initialPinCodeData)) {
            await stmt.run(pincode, info);
        }
        await stmt.finalize();
    }
    
    return newDb;
}

export async function getDb() {
  if (!db) {
    db = await initializeDatabase();
  }
  return db;
}

// --- FAQ Management ---
export async function getFaqs() {
    const db = await getDb();
    return db.all('SELECT id, question, answer FROM faqs');
}

export async function addFaq(question: string, answer: string) {
    const db = await getDb();
    return db.run('INSERT INTO faqs (question, answer) VALUES (?, ?)', question, answer);
}

export async function updateFaq(id: number, question: string, answer: string) {
    const db = await getDb();
    return db.run('UPDATE faqs SET question = ?, answer = ? WHERE id = ?', question, answer, id);
}

// --- PIN Code Management ---
export async function getPinCodes() {
    const db = await getDb();
    const rows = await db.all('SELECT pincode, info FROM pincodes');
    return rows.reduce((acc, row) => {
        acc[row.pincode] = row.info;
        return acc;
    }, {} as Record<string, string>);
}

export async function addPinCode(pincode: string, info: string) {
    const db = await getDb();
    return db.run('INSERT INTO pincodes (pincode, info) VALUES (?, ?)', pincode, info);
}

export async function updatePinCode(pincode: string, info: string) {
    const db = await getDb();
    return db.run('UPDATE pincodes SET info = ? WHERE pincode = ?', info, pincode);
}

// --- Media Management ---
export async function getMedia() {
    const db = await getDb();
    return db.all("SELECT id, title, type, url FROM media");
}

export async function addMedia(title: string, type: 'video' | 'image' | 'reel', url: string) {
    const db = await getDb();
    return db.run('INSERT INTO media (title, type, url) VALUES (?, ?, ?)', title, type, url);
}

export async function updateMedia(id: number, title: string, type: 'video' | 'image' | 'reel', url: string) {
    const db = await getDb();
    return db.run('UPDATE media SET title = ?, type = ?, url = ? WHERE id = ?', title, type, url, id);
}

export async function searchMedia(query: string) {
    const db = await getDb();
    // Using LIKE to find media with titles that contain the query string
    return db.all("SELECT id, title, type, url FROM media WHERE title LIKE ?", `%${query}%`);
}

// --- Unanswered Queries Management ---
export async function getUnansweredQueries() {
    const db = await getDb();
    return db.all('SELECT id, query, timestamp FROM unanswered_queries ORDER BY timestamp DESC');
}

export async function addUnansweredQuery(query: string) {
    const db = await getDb();
    return db.run('INSERT INTO unanswered_queries (query) VALUES (?)', query);
}

export async function deleteUnansweredQuery(id: number) {
    const db = await getDb();
    return db.run('DELETE FROM unanswered_queries WHERE id = ?', id);
}
