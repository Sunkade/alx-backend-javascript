const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 1245;
const DB_FILE = process.argv.length > 2 ? process.argv[2] : '';

/**
 * Counts the students in a CSV data file.
 * @param {String} dataPath The path to the CSV data file.
 * @returns {Promise<string>} A promise that resolves with the report.
 */
const countStudents = (dataPath) => {
  return new Promise((resolve, reject) => {
    if (!dataPath) {
      reject(new Error('Cannot load the database'));
      return;
    }

    fs.readFile(dataPath, 'utf-8', (err, data) => {
      if (err) {
        reject(new Error('Cannot load the database'));
        return;
      }

      const reportParts = [];
      const fileLines = data.trim().split('\n');
      const studentGroups = {};
      const dbFieldNames = fileLines[0].split(',');
      const studentPropNames = dbFieldNames.slice(0, -1);

      for (const line of fileLines.slice(1)) {
        const studentRecord = line.split(',');
        const studentPropValues = studentRecord.slice(0, -1);
        const field = studentRecord[studentRecord.length - 1];
        if (!studentGroups[field]) {
          studentGroups[field] = [];
        }
        const studentEntries = studentPropNames.map((propName, idx) => [propName, studentPropValues[idx]]);
        studentGroups[field].push(Object.fromEntries(studentEntries));
      }

      const totalStudents = Object.values(studentGroups).reduce((total, group) => total + group.length, 0);
      reportParts.push(`Number of students: ${totalStudents}`);
      for (const [field, group] of Object.entries(studentGroups)) {
        reportParts.push(`Number of students in ${field}: ${group.length}. List: ${group.map(student => student.firstname).join(', ')}`);
      }
      resolve(reportParts.join('\n'));
    });
  });
};

app.get('/', (_, res) => {
  res.send('Hello Holberton School!');
});

app.get('/students', async (_, res) => {
  try {
    const report = await countStudents(DB_FILE);
    const responseText = `This is the list of our students\n${report}`;
    res.type('text/plain').send(responseText);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : err.toString();
    res.status(500).type('text/plain').send(errorMessage);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});

module.exports = app;
