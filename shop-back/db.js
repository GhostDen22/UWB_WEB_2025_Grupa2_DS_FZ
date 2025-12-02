import { JSONFilePreset } from 'lowdb/node'

// Read or create db.json
const defaultData = { posts: [] }
const db = await JSONFilePreset('db.json', defaultData)

// Update db.json
await db.update(({ posts }) => posts.push('hello world'))

// Alternatively you can call db.write() explicitely later
// to write to db.json
db.data.posts.push('hello world')
await db.write()