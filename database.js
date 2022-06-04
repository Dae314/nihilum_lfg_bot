const sqlite3 = require('sqlite3');
const fs = require('node:fs');
const path = require('node:path');
const { exit } = require('node:process');

module.exports = class Database {
	// open an existing database, otherwise create a new one
	constructor(DBPATH = '') {
		this.dbPath = DBPATH ? DBPATH : './data/groups.db';
		this.dbFolder = path.dirname(this.dbPath);
		if(!fs.existsSync(this.dbFolder)) {
			fs.mkdirSync(this.dbFolder);
			console.log(`Database folder: ${this.dbFolder} created successfully.`);
		}
		this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE, (err) => {
			if (err && err.code == "SQLITE_CANTOPEN") {
				this.createDatabase();
				return;
			} else if (err) {
				console.log(`Error opening database: ${err}`);
				exit(500);
			}
		});
	}
	// create a new database
	async createDatabase() {
		console.log(`Creating new database at ${this.dbPath}`);
		this.db = new sqlite3.Database(this.dbPath, (err) => {
			if (err) {
				console.log(`Error creating database: ${err}`);
				exit(1);
			}
			this.createTables();
		});
	}
	// initialize database tables
	createTables() {
		this.db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY,
			username TEXT UNIQUE NOT NULL
		);
		CREATE TABLE IF NOT EXISTS groupTypes (
			id INTEGER PRIMARY KEY,
			name TEXT UNIQUE NOT NULL,
			memberMax INTEGER NOT NULL
		);
		CREATE TABLE IF NOT EXISTS groups (
			id INTEGER PRIMARY KEY,
			owner INTEGER NOT NULL,
			type INTEGER NOT NULL,
			createdAt TEXT NOT NULL,
			FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (type) REFERENCES groupTypes(id) ON DELETE CASCADE
		);
		CREATE TABLE IF NOT EXISTS membership (
			id INTEGER PRIMARY KEY,
			user INTEGER,
			groupID INTEGER,
			joinedAt TEXT NOT NULL,
			FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (groupID) REFERENCES groups(id) ON DELETE CASCADE
		);`);
	}
	// remove all data from the database and re-initialize the tables
	resetDatabase() {
		this.db.exec(`
			DROP TABLE IF EXISTS users;
			DROP TABLE IF EXISTS groupTypes;
			DROP TABLE IF EXISTS groups;
			DROP TABLE IF EXISTS membership;
		`, (err) => {
			if (err) {
				console.log(`Error wiping database: ${err}`);
				exit(1);
			}
			this.createTables();
		});
	}
	// insert test data into the database
	async loadTestData() {
		const now = new Date();
		await this.db.run(`INSERT INTO users (username)
			VALUES
				('user1'),
				('user2'),
				('user3'),
				('user4'),
				('user5'),
				('user6'),
				('user7'),
				('user8'),
				('user9'),
				('user10');`);
		await this.db.run(`INSERT INTO groupTypes (name, memberMax)
			VALUES
				('lab', 3),
				('hf', 5);`);
		await this.db.run(`INSERT INTO groups (owner, type, createdAt)
			VALUES
				(1, 1, '${now.toISOString()}'),
				(2, 2, '${now.toISOString()}');`);
		await this.db.run(`INSERT INTO membership (user, groupID, joinedAt)
			VALUES
				(1, 1, '${now.toISOString()}'),
				(2, 2, '${now.toISOString()}');`);
	}

	// custom run command to wrap result in a promise
	run(sql, params = []) {
		return new Promise((resolve, reject) => {
			this.db.run(sql, params, function (err) {
				if (err) {
					console.log(`Encountered error running sql: ${sql}`);
					console.log(err);
					reject(err);
				} else {
					resolve({ id: this.lastID });
				}
			});
		});
	}
	// custom get command to wrap result in a promise
	get(sql, params = []) {
		return new Promise((resolve, reject) => {
			this.db.get(sql, params, function (err, result) {
				if (err) {
					console.log(`Encountered error running sql: ${sql}`);
					console.log(err);
					reject(err);
				} else {
					resolve(result);
				}
			});
		});
	}
	// custom all command to wrap result in a promise
	all(sql, params = []) {
		return new Promise((resolve, reject) => {
			this.db.all(sql, params, function (err, rows) {
				if (err) {
					console.log(`Encountered error running sql: ${sql}`);
					console.log(err);
					reject(err);
				} else {
					resolve(rows);
				}
			});
		});
	}

	// user commands
	addUser(username) {
		const sql = `INSERT INTO users (username) VALUES ($username);`;
		const params = { $username: username };
		return this.run(sql, params);
	}
	getUser(id) {
		const sql = `SELECT * FROM users WHERE id = $id;`;
		const params = { $id: id };
		return this.get(sql, params);
	}
	getUserbyUsername(username) {
		const sql = `SELECT * FROM users WHERE username = $username;`;
		const params = { $username: username };
		return this.get(sql, params);
	}
	getAllUsers() {
		const sql = `SELECT * FROM users;`;
		return this.all(sql);
	}
	rmUser(id) {
		const sql = `DELETE FROM users WHERE id = $id;`;
		const params = { $id: id };
		return this.run(sql, params);
	}

	// groupType commands
	addGroupType(name, memberMax) {
		const sql = `INSERT INTO groupTypes (name, memberMax) VALUES ($name, $memberMax);`;
		const params = { $name: name, $memberMax: memberMax };
		return this.run(sql, params);
	}
	getGroupType(id) {
		const sql = `SELECT * FROM groupTypes WHERE id = $id;`;
		const params = { $id: id };
		return this.get(sql, params);
	}
	getGroupTypebyName(name) {
		const sql = `SELECT * FROM groupTypes WHERE name = $name;`;
		const params = { $name: name };
		return this.get(sql, params);
	}
	getAllGroupTypes() {
		const sql = `SELECT * FROM groupTypes;`;
		return this.all(sql);
	}
	rmGroupType(id) {
		const sql = `DELETE FROM groupTypes WHERE id = $id;`;
		const params = { $id: id };
		return this.run(sql, params);
	}

	// group commands
	addGroup(owner, type) {
		const now = new Date();
		const sql = `INSERT INTO groups (owner, type, createdAt)
			VALUES
				($owner, $type, $now);`;
		const params = { $owner: owner, $type: type, $now: now.toISOString() };
		return this.run(sql, params);
	}
	getGroup(id) {
		const sql = `SELECT * FROM groups WHERE id = $id;`;
		const params = { $id: id };
		return this.get(sql, params);
	}
	getGroupbyOwnerType(owner, type) {
		const sql = `SELECT * FROM groups WHERE owner = $owner AND type = $type;`;
		const params = { $owner: owner, $type: type };
		return this.get(sql, params);
	}
	getAllGroups() {
		const sql = `SELECT * FROM groups;`;
		return this.all(sql);
	}
	async userIsGroupOwner(userID, groupID) {
		const sql = `SELECT id FROM groups WHERE owner = $user AND id = $group;`;
		const params = { $user: userID, $group: groupID };
		const result = await this.all(sql, params);
		return result.length > 0;
	}
	rmGroup(id) {
		const sql = `DELETE FROM groups WHERE id = $id;`;
		const params = { $id: id };
		return this.run(sql, params);
	}

	// membership commands
	addMember(user, group) {
		const now = new Date();
		const sql = `INSERT INTO membership (user, groupID, joinedAt)
			VALUES
				($user, $group, $now);`;
		const params = { $user: user, $group: group, $now: now.toISOString() };
		return this.run(sql, params);
	}
	getMember(id) {
		const sql = `SELECT * FROM membership WHERE id = $id;`;
		const params = { $id: id };
		return this.get(sql, params);
	}
	getAllMembers() {
		const sql = `SELECT * FROM membership;`;
		return this.all(sql);
	}
	rmMember(user, group) {
		const sql = `DELETE FROM membership WHERE user = $user AND groupID = $group;`;
		const params = { $user: user, $group: group };
		return this.run(sql, params);
	}
	getGroupMembers(group) {
		const sql = `
			SELECT
				users.id as id,
				users.username as username
			FROM
				membership
				INNER JOIN users ON membership.user = users.id
			WHERE
				groupID = $group;`;
		const params = { $group: group };
		return this.all(sql, params);
	}
	async userIsInGroup(userID, groupID) {
		const sql = `SELECT id FROM membership WHERE user = $user AND groupID = $group;`;
		const params = { $user: userID, $group: groupID };
		const result = await this.all(sql, params);
		return result.length > 0;
	}
}
