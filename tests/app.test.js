const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const Note = require("../models/Note");

const createUser = async () => {
    const curPassword = "hahahaha";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(curPassword, salt);

    const newUser = new User({
        username: "bansilala",
        password: hashedPassword
    })
    await newUser.save();
}

require("dotenv").config();

beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany();
    await Note.deleteMany();
});

/* Closing database connection after each test. */
afterEach(async () => {
    await mongoose.connection.close();
});

describe('POST /api/auth/signup', () => {
    it('should sign up a new user', async () => {
        const newUser = {
            username: "bansilala",
            password: "hahahaha"
        }
        const res = await request(app).post("/api/auth/signup").send(newUser);
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe("User created successfully!")
    });

});

describe('POST /api/auth/login', () => {
    it('should sign up a new user', async () => {
        await createUser();
        const user = {
            username: "bansilala",
            password: "hahahaha"
        }
        const res = await request(app).post("/api/auth/login").send(user);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Login successful!")
    });

});


describe('POST /api/notes', () => {
    it('should create a new note for an authenticated user', async () => {
        await createUser();
        const token = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'bansilala',
                password: 'hahahaha',
            })
            .then((res) => res.body.token);

        const newNote = {
            title: 'Test Note',
            content: 'This is a test note.',
        };
        const res = await request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send(newNote);
        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe('Test Note');
        expect(res.body.content).toBe('This is a test note.');
    });
});