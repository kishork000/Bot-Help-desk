
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

    // Use a transaction to ensure all schema changes are atomic
    await newDb.exec('BEGIN TRANSACTION;');
    try {
        await newDb.exec(`
            CREATE TABLE IF NOT EXISTS faqs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT NOT NULL,
                answer TEXT NOT NULL
            );
        `);

        await newDb.exec(`
            CREATE TABLE IF NOT EXISTS pincodes (
                pincode TEXT PRIMARY KEY,
                info TEXT NOT NULL
            );
        `);
        
        await newDb.exec(`
            CREATE TABLE IF NOT EXISTS media (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('video', 'image', 'reel')),
                category TEXT NOT NULL DEFAULT 'general',
                url TEXT NOT NULL
            );
        `);

        await newDb.exec(`
            CREATE TABLE IF NOT EXISTS unanswered_conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query TEXT NOT NULL,
                answer TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Check if media table needs migration for category column
        const mediaCols = await newDb.all("PRAGMA table_info(media);");
        if (!mediaCols.some(col => col.name === 'category')) {
            await newDb.exec('ALTER TABLE media ADD COLUMN category TEXT NOT NULL DEFAULT "general"');
        }

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
        
        await newDb.exec('COMMIT;');
    } catch (e) {
        await newDb.exec('ROLLBACK;');
        throw e;
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
    await db.run('INSERT INTO faqs (question, answer) VALUES (?, ?)', question, answer);
}

export async function updateFaq(id: number, question: string, answer: string) {
    const db = await getDb();
    await db.run('UPDATE faqs SET question = ?, answer = ? WHERE id = ?', question, answer, id);
}

export async function searchFaqs(query: string) {
    const db = await getDb();
    // Use OR logic to be less restrictive
    const searchTerms = query.split(' ').map(term => `%${term}%`);
    const whereClauses = searchTerms.map(() => '(question LIKE ? OR answer LIKE ?)').join(' OR ');
    const sql = `SELECT question, answer FROM faqs WHERE ${whereClauses}`;
    const params = searchTerms.flatMap(term => [term, term]);
    return db.all(sql, ...params);
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
    await db.run('INSERT INTO pincodes (pincode, info) VALUES (?, ?)', pincode, info);
}

export async function updatePinCode(pincode: string, info: string) {
    const db = await getDb();
    await db.run('UPDATE pincodes SET info = ? WHERE pincode = ?', info, pincode);
}

export async function searchPinCodes(query: string) {
    const db = await getDb();
    const searchTerms = query.split(' ').map(term => `%${term}%`);
    const whereClauses = searchTerms.map(() => 'pincode LIKE ? OR info LIKE ?').join(' OR ');
    const sql = `SELECT pincode, info FROM pincodes WHERE ${whereClauses}`;
    const params = searchTerms.flatMap(term => [term, term]);
    return db.all(sql, ...params);
}

// --- Media Management ---
export async function getMedia() {
    const db = await getDb();
    return db.all("SELECT id, title, type, category, url FROM media");
}

export async function addMedia(title: string, type: 'video' | 'image' | 'reel', category: string, url: string) {
    const db = await getDb();
    await db.run('INSERT INTO media (title, type, category, url) VALUES (?, ?, ?, ?)', title, type, category, url);
}

export async function updateMedia(id: number, title: string, type: 'video' | 'image' | 'reel', category: string, url: string) {
    const db = await getDb();
    await db.run('UPDATE media SET title = ?, type = ?, category = ?, url = ? WHERE id = ?', title, type, category, url, id);
}

export async function searchMedia(query: string) {
    const db = await getDb();
    const searchTerms = query.split(' ').filter(term => term.length > 0).map(term => `%${term}%`);

    if (searchTerms.length === 0) {
        return [];
    }

    const whereClauses = searchTerms.map(() => '(title LIKE ? OR category LIKE ?)').join(' OR ');
    const sql = `SELECT id, title, type, url FROM media WHERE ${whereClauses}`;
    const params = searchTerms.flatMap(term => [term, term]);

    return db.all(sql, ...params);
}

// --- Unanswered Conversations ---
export async function getUnansweredConversations() {
    const db = await getDb();
    return db.all('SELECT id, query, answer, timestamp FROM unanswered_conversations ORDER BY timestamp DESC');
}

export async function addUnansweredConversation(query: string, answer: string | null) {
    const db = await getDb();
    await db.run('INSERT INTO unanswered_conversations (query, answer) VALUES (?, ?)', query, answer);
}

export async function deleteUnansweredConversation(id: number) {
    const db = await getDb();
    await db.run('DELETE FROM unanswered_conversations WHERE id = ?', id);
}
