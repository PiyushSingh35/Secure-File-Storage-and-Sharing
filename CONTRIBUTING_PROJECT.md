# Contributing to Secure File Storage & Sharing Application

We welcome contributions from the community! Here's how you can help improve this Node.js backend project.

---

## How to Contribute

### Step 1: Fork the Repository

Click the Fork button on GitHub to create your own copy.

### Step 2: Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/Secure-File-Storage.git
cd Secure-File-Storage
```

### Step 3: Create a Feature Branch

```bash
git checkout -b feature/YourFeature
```

Use descriptive branch names:
- feature/add-file-compression
- bugfix/fix-encryption-issue
- docs/improve-api-docs

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Make Your Changes

Edit the code and test thoroughly.

### Step 6: Test Your Changes

Create test file to verify:

```bash
npm start
```

Then in Postman:
1. Test authentication endpoints
2. Test file upload/download
3. Test share link creation
4. Verify encryption works
5. Check database operations

Test Checklist:

```
[ ] Server starts without errors
[ ] MongoDB connects successfully
[ ] Registration works
[ ] Login generates valid token
[ ] File upload encrypts correctly
[ ] File download decrypts correctly
[ ] Share links expire properly
[ ] Download limits enforced
[ ] No memory leaks
[ ] Error handling works
```

### Step 7: Commit Your Changes

```bash
git add .
git commit -m "Feature: Add file compression support"
```

Use clear commit messages.

### Step 8: Push to Your Fork

```bash
git push origin feature/YourFeature
```

### Step 9: Create a Pull Request

Go to original repository and click New Pull Request. Describe changes clearly.

---

## Code Style Guide

Follow these standards:

### JavaScript Code Style

- Use 2 spaces for indentation (NOT tabs)
- Use const/let (NOT var)
- Use arrow functions when appropriate
- Add JSDoc comments for functions
- Keep lines under 100 characters

Example:

```javascript
/**
 * Encrypt file buffer using AES-256-GCM
 * @param {Buffer} fileBuffer - File data to encrypt
 * @returns {Object} { iv, authTag, encrypted }
 */
const encryptFile = (fileBuffer) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(fileBuffer),
    cipher.final()
  ]);
  
  return {
    iv,
    authTag: cipher.getAuthTag(),
    encrypted
  };
};
```

### Variable Naming

- Functions: camelCase
- Constants: UPPERCASE_WITH_UNDERSCORES
- Classes: PascalCase
- Private variables: _leadingUnderscore

### Error Handling

All async functions should have try-catch:

```javascript
router.post('/upload', auth, async (req, res) => {
  try {
    // operation
    res.status(200).json({ message: 'Success' });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});
```

---

## Areas for Contribution

Component | What's Needed
-----------|----------
Encryption | Implement file compression, streaming encryption
Authentication | Add OAuth2, two-factor authentication
API | Add rate limiting, request validation
Database | Add query optimization, caching
Features | File preview, versioning, sharing improvements
Testing | Unit tests, integration tests
Documentation | API docs, setup guides
Performance | Optimize encryption, reduce memory usage
Security | Implement CORS properly, add request logging

---

## Bug Reports

Found a bug? Report with:

1. Clear description
2. Steps to reproduce
3. Expected vs actual behavior
4. Error logs/screenshots
5. Environment details

Example:

Title: File encryption fails for files > 10MB

Description:
When uploading files larger than 10MB, encryption fails with error.

Steps:
1. Register user
2. Try to upload 15MB file
3. Observe error

Expected: File encrypts successfully
Actual: Error in encryption process

Error:
```
Error: buffer too large
  at encryptFile (utils/encryption.js:15)
```

System: Node.js v16, MongoDB 4.4, Windows 10

---

## Feature Requests

Suggest improvements with:

1. Clear description
2. Why it's useful
3. Implementation approach

Example:

Title: Add batch file upload

Description:
Allow users to upload multiple files at once instead of one at a time.

Usefulness:
Improves user experience for uploading many files. Currently requires multiple requests.

Implementation:
Modify upload endpoint to accept array of files using multer.array().

---

## Testing Requirements

Before submitting PR:

1. Test all affected endpoints in Postman
2. Verify encryption/decryption works
3. Check authentication on protected routes
4. Test error scenarios (missing fields, invalid tokens)
5. Monitor console for errors
6. Check MongoDB for proper data storage
7. Verify no sensitive data in logs

Test Scenarios:

```
Authentication:
[ ] Register new user
[ ] Login with correct credentials
[ ] Login with wrong password fails
[ ] Token validation works

File Operations:
[ ] Upload file encrypts correctly
[ ] Download decrypts correctly
[ ] Delete removes from database
[ ] List shows user's files only

Sharing:
[ ] Create share link works
[ ] Public download without auth works
[ ] Expired links are rejected
[ ] Download limit is enforced
[ ] Download count increments

Error Handling:
[ ] Missing fields return 400
[ ] Invalid token returns 401
[ ] Missing files return 404
[ ] Unauthorized access returns 403
[ ] Server errors return 500
```

---

## Documentation

When adding features:

1. Update README with new functionality
2. Document API endpoints in README
3. Add JSDoc to functions
4. Update .env.example if needed
5. Add code comments for complex logic

---

## Commit Message Format

Use clear format:

```
Type: Brief description

Longer explanation of changes and why.

Type can be:
- Feature: New functionality
- Bugfix: Bug fix
- Refactor: Code refactoring
- Perf: Performance improvement
- Docs: Documentation changes
- Test: Adding tests
```

Examples:

Good:
```
Feature: Add file compression before encryption

Implemented zlib compression for files before encryption
to reduce storage space. Decompression happens after
decryption during download.
```

Bad:
```
fixed stuff
```

---

## Pull Request Guidelines

When submitting PR:

1. Clear title and description
2. Reference related issues
3. List all changes made
4. Describe testing done
5. Mention breaking changes if any
6. Follow code style

Example:

Title: Add file compression support

Description:
Implements automatic compression of files before encryption to reduce storage requirements.

Changes:
- Added compression utility in utils/
- Modified file upload to compress before encryption
- Updated file download to decompress after decryption
- Added compression level configuration in .env

Testing:
- Tested with various file types and sizes
- Verified compression reduces file size by 30-50%
- Confirmed decompression produces identical files
- No performance degradation

Breaking Changes: None

Related Issues: #42

---

## Code Review Process

1. Maintainers review your code
2. Feedback and suggestions provided
3. Make requested changes
4. Code approved and merged

Be open to feedback!

---

## Development Setup

Setup dev environment:

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/Secure-File-Storage.git
cd Secure-File-Storage
npm install

# Create .env
echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/test-db
JWT_SECRET=test-secret
ENCRYPTION_KEY=test-key" > .env

# Start MongoDB (separate terminal)
mongod

# Run server
npm start

# Test in Postman
# Import test requests and verify all work
```

---

## Project Structure Guide

models/
- User.js: User authentication schema
- File.js: Encrypted file storage schema
- ShareToken.js: Share link schema

routes/
- authRoutes.js: /api/auth endpoints
- fileRoutes.js: /api/files endpoints
- shareRoutes.js: /api/share endpoints

middleware/
- auth.js: JWT verification middleware

utils/
- encryption.js: AES-256-GCM encryption functions

server.js: Main application file

---

## Best Practices

Follow these principles:

- Keep functions small and focused
- Use meaningful variable names
- Add error handling everywhere
- Write defensive code
- Don't expose sensitive info
- Optimize database queries
- Test edge cases
- Comment complex logic
- Follow existing code style
- Review before committing

---

## Questions?

If you have questions:

1. Check existing documentation
2. Look at similar code in project
3. Search closed issues
4. Open a new issue with question tag
5. Email maintainer

---

## Code of Conduct

Be respectful and professional:

- Treat everyone with respect
- Welcome newcomers
- Provide constructive feedback
- No harassment or discrimination
- Focus on ideas, not individuals

---

Thank you for contributing!

Together we build better, more secure tools.
