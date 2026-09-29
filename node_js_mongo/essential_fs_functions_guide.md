# Essential Node.js `fs` Module Functions: Practical Guide

This guide covers 10+ of the most important and frequently used functions in the Node.js `fs` (File System) module across both modern `fs/promises` and synchronous/stream variations.

---

## 1. `fs.readFile` / `fs.promises.readFile`
Reads the full contents of a file into memory.

```javascript
import fs from 'fs/promises';

try {
  const content = await fs.readFile('./config.json', 'utf-8');
  console.log(JSON.parse(content));
} catch (err) {
  console.error('Failed to read file:', err.message);
}
```

---

## 2. `fs.writeFile` / `fs.promises.writeFile`
Writes data to a file, replacing the file if it already exists or creating a new one.

```javascript
import fs from 'fs/promises';

const data = JSON.stringify({ appName: 'MyApp', version: '1.0.0' }, null, 2);

try {
  await fs.writeFile('./app-manifest.json', data, 'utf-8');
  console.log('Manifest updated successfully.');
} catch (err) {
  console.error('Write error:', err);
}
```

---

## 3. `fs.appendFile` / `fs.promises.appendFile`
Appends data to a file, creating the file if it does not exist yet.

```javascript
import fs from 'fs/promises';

async function logEvent(message) {
  const logLine = `[${new Date().toISOString()}] ${message}
`;
  await fs.appendFile('./logs/app.log', logLine, 'utf-8');
}

await logEvent('User logged in successfully.');
```

---

## 4. `fs.unlink` / `fs.promises.unlink`
Deletes a file from the file system.

```javascript
import fs from 'fs/promises';

try {
  await fs.unlink('./temp/upload-cache.tmp');
  console.log('Temporary file deleted.');
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log('File does not exist, nothing to delete.');
  } else {
    console.error('Delete error:', err);
  }
}
```

---

## 5. `fs.mkdir` / `fs.promises.mkdir`
Creates a new directory. The `recursive: true` option acts like `mkdir -p` (creates parent folders automatically).

```javascript
import fs from 'fs/promises';

try {
  // Safe directory creation: won't throw if nested folders exist
  await fs.mkdir('./uploads/users/avatars', { recursive: true });
  console.log('Directory structure ready.');
} catch (err) {
  console.error('Directory creation failed:', err);
}
```

---

## 6. `fs.readdir` / `fs.promises.readdir`
Reads the contents of a directory and returns an array of filenames/folder names.

```javascript
import fs from 'fs/promises';

try {
  // setting withFileTypes: true returns Dirent objects with details
  const files = await fs.readdir('./src/controllers', { withFileTypes: true });

  files.forEach((file) => {
    console.log(`${file.name} -> ${file.isDirectory() ? 'Folder' : 'File'}`);
  });
} catch (err) {
  console.error('Readdir error:', err);
}
```

---

## 7. `fs.stat` / `fs.promises.stat`
Inspects file metadata (size, creation date, permissions, file vs directory check).

```javascript
import fs from 'fs/promises';

try {
  const stats = await fs.stat('./media/video.mp4');

  console.log('Is File?', stats.isFile());
  console.log('Is Directory?', stats.isDirectory());
  console.log('Size in MB:', (stats.size / (1024 * 1024)).toFixed(2));
  console.log('Last Modified:', stats.mtime);
} catch (err) {
  console.error('Stat error:', err);
}
```

---

## 8. `fs.access` / `fs.promises.access`
Tests user permissions and checks if a file or directory exists.

```javascript
import fs from 'fs/promises';
import { constants } from 'fs';

async function checkAccess(path) {
  try {
    // Check if file exists AND is readable/writable
    await fs.access(path, constants.F_OK | constants.R_OK | constants.W_OK);
    console.log(`${path} is accessible and writable.`);
  } catch {
    console.log(`${path} does not exist or access is denied.`);
  }
}

await checkAccess('./config/env.local');
```

---

## 9. `fs.rename` / `fs.promises.rename`
Renames a file or moves it to a new path.

```javascript
import fs from 'fs/promises';

try {
  // Move file from temporary directory to permanent uploads folder
  await fs.rename('./tmp/file-123.pdf', './uploads/invoices/invoice-123.pdf');
  console.log('File moved successfully.');
} catch (err) {
  console.error('Rename/Move error:', err);
}
```

---

## 10. `fs.rm` / `fs.promises.rm`
Removes files and directories. Replaces older directory removal methods (`rmdir`).

```javascript
import fs from 'fs/promises';

try {
  // Recursively delete directory and all contents inside without throwing if missing
  await fs.rm('./dist', { recursive: true, force: true });
  console.log('Build directory cleaned.');
} catch (err) {
  console.error('Cleanup error:', err);
}
```

---

## 11. `fs.createReadStream`
Creates a readable stream for memory-efficient handling of large files (e.g. log files, videos).

```javascript
import fs from 'fs';

const readStream = fs.createReadStream('./large-file.zip', {
  highWaterMark: 64 * 1024, // 64 KB chunk size
});

readStream.on('data', (chunk) => {
  console.log(`Received chunk of size: ${chunk.length} bytes`);
});

readStream.on('end', () => {
  console.log('Finished reading file stream.');
});
```

---

## 12. `fs.createWriteStream`
Creates a writable stream for incrementally writing large datasets to disk.

```javascript
import fs from 'fs';

const writeStream = fs.createWriteStream('./output/huge-dataset.csv');

writeStream.write('id,username,email');
writeStream.write('1,john_doe,john@example.com');
writeStream.end('2,jane_doe,jane@example.com');

writeStream.on('finish', () => {
  console.log('Stream write completed.');
});
```

---

## Function Selection Summary

| Function | Modern Equivalent | Core Purpose |
| :--- | :--- | :--- |
| `fs.readFile` | `fs/promises.readFile` | Read small/medium file contents |
| `fs.writeFile` | `fs/promises.writeFile` | Overwrite or create file |
| `fs.appendFile` | `fs/promises.appendFile` | Append text/logs to file |
| `fs.unlink` | `fs/promises.unlink` | Delete a file |
| `fs.mkdir` | `fs/promises.mkdir` | Create directories |
| `fs.readdir` | `fs/promises.readdir` | List files in directory |
| `fs.stat` | `fs/promises.stat` | Fetch metadata (size, modified time) |
| `fs.access` | `fs/promises.access` | Check file existence/permissions |
| `fs.rename` | `fs/promises.rename` | Rename or move files |
| `fs.rm` | `fs/promises.rm` | Delete files or directories recursively |
| `fs.createReadStream` | Stream Event API / Pipeline | Memory-efficient file reading (chunks) |
| `fs.createWriteStream` | Stream Event API / Pipeline | Memory-efficient file writing (chunks) |