'use strict';

const express = require('express');

const app = express();
const port = Number(process.env.PORT) || 3000;
let nextId = 1;
const books = [];

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Books REST API', endpoints: { books: '/books' } });
});

function validateBook(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object.';
  }
  for (const field of ['title', 'author']) {
    if (typeof body[field] !== 'string' || body[field].trim() === '') {
      return `The ${field} field is required and must be a non-empty string.`;
    }
  }
  return null;
}

app.get('/books', (_req, res) => {
  res.json(books);
});

app.get('/books/:id', (req, res) => {
  const book = books.find((item) => item.id === Number(req.params.id));
  if (!book) return res.status(404).json({ error: 'Book not found.' });
  res.json(book);
});

app.post('/books', (req, res) => {
  const error = validateBook(req.body);
  if (error) return res.status(400).json({ error });

  const book = {
    id: nextId++,
    title: req.body.title.trim(),
    author: req.body.author.trim(),
  };
  books.push(book);
  res.location(`/books/${book.id}`).status(201).json(book);
});

app.put('/books/:id', (req, res) => {
  const error = validateBook(req.body);
  if (error) return res.status(400).json({ error });

  const index = books.findIndex((item) => item.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Book not found.' });

  books[index] = {
    id: books[index].id,
    title: req.body.title.trim(),
    author: req.body.author.trim(),
  };
  res.json(books[index]);
});

app.delete('/books/:id', (req, res) => {
  const index = books.findIndex((item) => item.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Book not found.' });
  books.splice(index, 1);
  res.status(204).end();
});

app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Request body contains invalid JSON.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(port, () => {
  console.log(`Books API listening at http://localhost:${port}`);
});

