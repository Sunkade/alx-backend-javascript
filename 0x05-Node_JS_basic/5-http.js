const http = require('http');
const fs = require('fs');

const PORT = 1245;
const HOST = 'localhost';
const app = http.createServer();
const DB_FILE = process.argv.length > 2 ? process.argv[2] : '';

/**
 * Determine the students in a CSV data file.
 * @Path {String} dataPath The path to the CSV data file.
 * @returns {Promise<string>} A promise that resolves with the report.
 */
const countStudents = (dataPath) => new Promise((resolve, reject) => {
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

/**
 * Sends a response with the given status code and content.
 * @Path {http.ServerResponse} res The response object.
 * @Path {number} statusCode The status code.
 * @path {string} content The content to send.
 */
const sendResponse = (res, statusCode, content) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/plain');
  res.end(content);
};

const SERVER_ROUTE_HANDLERS = [
  {
    route: '/',
    handler(_, res) {
      sendResponse(res, 200, 'Hello Holberton School!');
    },
  },
  {
    route: '/students',
    handler(_, res) {
      countStudents(DB_FILE)
        .then(report => sendResponse(res, 200, `This is the list of our students\n${report}`))
        .catch(err => sendResponse(res, 500, err instanceof Error ? err.message : err.toString()));
    },
  },
];

app.on('request', (req, res) => {
  const routeHandler = SERVER_ROUTE_HANDLERS.find(handler => handler.route === req.url);
  if (routeHandler) {
    routeHandler.handler(req, res);
  } else {
    sendResponse(res, 404, 'Not Found');
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server listening at -> http://${HOST}:${PORT}`);
});

module.exports = app;

