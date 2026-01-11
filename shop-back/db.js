import { JSONFilePreset } from 'lowdb/node'

const defaultData = { posts: [] }
const db = await JSONFilePreset('db.json', defaultData)

await db.update(({ posts }) => posts.push('hello world'))

db.data.posts.push('hello world')
await db.write()