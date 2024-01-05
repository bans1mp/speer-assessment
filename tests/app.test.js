const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const Note = require("../models/Note");
require("dotenv").config();

//Functions to hash password and add user to database for testing
const createUser = async () => {
    const curPassword = "hahahaha";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(curPassword, salt);

    const newUser = new User({
        username: "bansilala",
        password: hashedPassword
    })
    const savedUser = await newUser.save();
    return savedUser;
}

const createUser2 = async () => {
    const curPassword = "hahahaha";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(curPassword, salt);

    const newUser = new User({
        username: "bansilala2",
        password: hashedPassword
    })
    const savedUser = await newUser.save();
    return savedUser;
}

//Clearing database before test and closing connection after each test
beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany();
    await Note.deleteMany();
});

afterEach(async () => {
    await mongoose.connection.close();
});

//Signup Test
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

//Login Test
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

//Post a note test
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

//Get all notes test
describe('GET /api/notes', () => {
    it('should get a list of all notes for an authenticated user', async () => {
        const user = await createUser();

        const token = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'bansilala',
                password: 'hahahaha',
            })
            .then((res) => res.body.token);

        // Create test notes
        await Note.create([
            { title: 'Note 1', content: 'Content 1', owner: user._id },
            { title: 'Note 2', content: 'Content 2', owner: user._id },
        ]);

        const res = await request(app)
            .get('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.length).toBe(2);
    });
});

//Get note by ID test
describe('GET /api/notes/:id', () => {
    it('should get a specific note by ID for an authenticated user', async () => {
        const user = await createUser();

        const token = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'bansilala',
                password: 'hahahaha',
            })
            .then((res) => res.body.token);

        const note = await Note.create({ title: 'Test Note', content: 'Note Content', owner: user._id });

        const res = await request(app)
            .get(`/api/notes/${note._id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.title).toBe('Test Note');
    });

    it('should return 404 if the note ID is not found', async () => {
        const user = await createUser();

        const token = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'bansilala',
                password: 'hahahaha',
            })
            .then((res) => res.body.token);

        const nonExistingNoteId = "lmaothisisnotit";

        await request(app)
            .get(`/api/notes/${nonExistingNoteId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
    });
});

//Update a note test
describe('PUT /api/notes/:id', () => {
    it('should update an existing note by ID for an authenticated user', async () => {
        const user = await createUser();

        const token = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'bansilala',
                password: 'hahahaha',
            })
            .then((res) => res.body.token);

        const existingNote = await Note.create({ title: 'Old Title', content: 'Old Content', owner: user._id });

        const updatedNote = {
            title: 'New Title',
            content: 'New Content',
        };

        const res = await request(app)
            .put(`/api/notes/${existingNote._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedNote)
            .expect(200);

        expect(res.body.title).toBe('New Title');
        expect(res.body.content).toBe('New Content');
    });

    it('should return 404 if the note ID is not found', async () => {
        const user = await createUser();

        const token = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'bansilala',
                password: 'hahahaha',
            })
            .then((res) => res.body.token);

        const nonExistingNoteId = "thisdoesnotexist";

        await request(app)
            .put(`/api/notes/${nonExistingNoteId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
    });
});

//Delete a note test
describe('DELETE /api/notes/:id', () => {
    it('should delete an existing note by ID for an authenticated user', async () => {
        const user = await createUser();

        const token = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'bansilala',
                password: 'hahahaha',
            })
            .then((res) => res.body.token);

        const existingNote = await Note.create({ title: 'Test Note', content: 'This is a test note.', owner: user._id });

        await request(app)
            .delete(`/api/notes/${existingNote._id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const deletedNote = await Note.findById(existingNote._id);
        expect(deletedNote).toBeNull();
    });

    it('should return 404 if the note ID is not found', async () => {
        const user = await createUser();
        const token = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'bansilala',
                password: 'hahahaha',
            })
            .then((res) => res.body.token);

        const nonExistingNoteId = "thisdoesnotexist";

        await request(app)
            .delete(`/api/notes/${nonExistingNoteId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
    });
});


//Share a note test
describe('POST /api/notes/:id/share', () => {
    it('should share a note with another user for an authenticated user', async () => {
        const user1 = await createUser();
        const user2 = await createUser2();

        const tokenUser1 = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'bansilala',
                password: 'hahahaha',
            })
            .then((res) => res.body.token);
        const newNote = new Note({ title: 'Shared Note', content: 'This note will be shared.', owner: user1._id });
        const note = await newNote.save();
        // console.log(note._id);
        const res = await request(app)
            .post(`/api/notes/${note._id}/share`)
            .set('Authorization', `Bearer ${tokenUser1}`)
            .send({ sharedWithUserId: user2._id })
            .expect(200);

        expect(res.body.sharedWith).toContainEqual(user2._id.toString());
    });

    it('should return 404 if the note ID is not found', async () => {
        const user = await createUser();

        const token = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'bansilala',
                password: 'hahahaha',
            })
            .then((res) => res.body.token);

        const nonExistingNoteId = "randomnoteid";

        await request(app)
            .post(`/api/notes/${nonExistingNoteId}/share`)
            .set('Authorization', `Bearer ${token}`)
            .send({ sharedWithUserId: user._id })
            .expect(404);
    });

    it('should return 404 if the shared user ID is not found', async () => {
        const user = await createUser();

        const token = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'bansilala',
                password: 'hahahaha',
            })
            .then((res) => res.body.token);

        const note = await Note.create({ title: 'Test Note', content: 'This is a test note.', owner: user._id });

        const nonExistingUserId = "randomuser";

        await request(app)
            .post(`/api/notes/${note._id}/share`)
            .set('Authorization', `Bearer ${token}`)
            .send({ sharedWithUserId: nonExistingUserId })
            .expect(404);
    });
});

//Search endpoint test
describe('Search Endpoint', () => {
    describe('GET /api/search', () => {
        it('should search for notes based on keywords for an authenticated user', async () => {
            const user = await createUser();

            const token = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'bansilala',
                    password: 'hahahaha',
                })
                .then((res) => res.body.token);


            const newNote = {
                title: 'Test Note',
                content: 'This is a test note for searching.',
                owner: user._id,
            };
            await Note.create(newNote);

            const searchQuery = 'searching';

            const res = await request(app)
                .get(`/api/search?q=${searchQuery}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].title).toBe('Test Note');
        });
    });
});
