-- Demo catalog data. User accounts (admin/librarian/members) are seeded via
-- backend/app/utils/seed.py instead, since their passwords must go through
-- the application's real bcrypt hashing rather than a hard-coded hash here.

INSERT INTO categories (name, description) VALUES
('Programming', 'Software development and computer programming'),
('Fiction', 'Novels and fictional literature'),
('Science', 'Popular science and physics'),
('Business', 'Business, economics and management'),
('Self-Help', 'Personal development and self-improvement');

INSERT INTO authors (name) VALUES
('Robert C. Martin'), ('Eric Matthes'), ('Martin Fowler'), ('George Orwell'),
('Harper Lee'), ('Carl Sagan'), ('Yuval Noah Harari'), ('James Clear'),
('Andy Weir'), ('J.K. Rowling'), ('Douglas Crockford'), ('Kyle Simpson');

INSERT INTO books (isbn, title, publisher, publication_year, language, total_copies, available_copies) VALUES
('9780132350884', 'Clean Code', 'Prentice Hall', 2008, 'English', 4, 4),
('9781593279288', 'Python Crash Course', 'No Starch Press', 2019, 'English', 5, 5),
('9780134757599', 'Refactoring', 'Addison-Wesley', 2018, 'English', 3, 3),
('9780451524935', '1984', 'Signet Classics', 1961, 'English', 6, 6),
('9780061120084', 'To Kill a Mockingbird', 'Harper Perennial', 2006, 'English', 4, 4),
('9780345539434', 'Cosmos', 'Ballantine Books', 2013, 'English', 2, 2),
('9780062316097', 'Sapiens', 'Harper', 2015, 'English', 5, 5),
('9781847941831', 'Atomic Habits', 'Avery', 2018, 'English', 6, 6),
('9780553418026', 'The Martian', 'Crown', 2014, 'English', 3, 3),
('9780439708180', "Harry Potter and the Sorcerer's Stone", 'Scholastic', 1998, 'English', 8, 8),
('9780596517748', 'JavaScript: The Good Parts', "O'Reilly", 2008, 'English', 3, 3),
('9781491904244', "You Don't Know JS: Scope & Closures", "O'Reilly", 2014, 'English', 2, 2),
('9780132350889', 'Clean Architecture', 'Prentice Hall', 2017, 'English', 3, 3),
('9780262033848', 'Introduction to Algorithms', 'MIT Press', 2009, 'English', 2, 2),
('9781449331818', 'Learning Python', "O'Reilly", 2013, 'English', 4, 4),
('9780201633610', 'Design Patterns', 'Addison-Wesley', 1994, 'English', 2, 2),
('9780321125217', 'Domain-Driven Design', 'Addison-Wesley', 2003, 'English', 2, 2),
('9780553380163', 'A Brief History of Time', 'Bantam', 1998, 'English', 3, 3),
('9780743273565', 'The Great Gatsby', "Scribner", 2004, 'English', 5, 5),
('9780857197689', 'Thinking, Fast and Slow', 'Farrar, Straus and Giroux', 2011, 'English', 3, 3);

INSERT INTO book_authors (book_id, author_id) VALUES
(1, 1), (13, 1),
(2, 2), (15, 2),
(3, 3), (17, 3),
(4, 4),
(5, 5),
(6, 6), (18, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10),
(11, 11),
(12, 12);

INSERT INTO book_categories (book_id, category_id) VALUES
(1, 1), (2, 1), (3, 1), (11, 1), (12, 1), (13, 1), (14, 1), (15, 1), (16, 1), (17, 1),
(4, 2), (5, 2), (9, 2), (10, 2), (19, 2),
(6, 3), (18, 3),
(7, 4), (20, 4),
(8, 5);
