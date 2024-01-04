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
    const savedUser = await newUser.save();
    return savedUser;
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
            .expect(500);
    });
});

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

        // Verify that the note has been deleted
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

describe('POST /api/notes/:id/share', () => {
    it('should share a note with another user for an authenticated user', async () => {
        const user1 = new User({
            username: 'user1',
            password: 'user1password',
        });
        const user2 = new User({
            username: 'user2',
            password: 'user2password',
        });
        await user1.save();
        await user2.save();

        const tokenUser1 = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'user1',
                password: 'user1password',
            })
            .then((res) => res.body.token);

        const tokenUser2 = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'user2',
                password: 'user2password',
            })
            .then((res) => res.body.token);

        const note = await Note.create({ title: 'Shared Note', content: 'This note will be shared.', owner: user1._id });

        const res = await request(app)
            .post(`/api/notes/${note._id}/share`)
            .set('Authorization', `Bearer ${tokenUser1}`)
            .send({ sharedUserId: user2._id })
            .expect(200);

        // Verify that the note is now shared with user2
        expect(res.body.sharedWith).toContainEqual(user2._id.toString());
    });

    it('should return 404 if the note ID is not found', async () => {
        const user = new User({
            username: 'bansilala',
            password: 'hahahaha',
        });
        await user.save();

        const token = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'bansilala',
                password: 'hahahaha',
            })
            .then((res) => res.body.token);

        const nonExistingNoteId = mongoose.Types.ObjectId();

        await request(app)
            .post(`/api/notes/${nonExistingNoteId}/share`)
            .set('Authorization', `Bearer ${token}`)
            .send({ sharedUserId: user._id })
            .expect(404);
    });

    it('should return 404 if the shared user ID is not found', async () => {
        const user = new User({
            username: 'bansilala',
            password: 'hahahaha',
        });
        await user.save();

        const token = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'bansilala',
                password: 'hahahaha',
            })
            .then((res) => res.body.token);

        const note = await Note.create({ title: 'Test Note', content: 'This is a test note.', owner: user._id });

        const nonExistingUserId = mongoose.Types.ObjectId();

        await request(app)
            .post(`/api/notes/${note._id}/share`)
            .set('Authorization', `Bearer ${token}`)
            .send({ sharedUserId: nonExistingUserId })
            .expect(404);
    });
});