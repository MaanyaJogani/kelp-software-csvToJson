const express = require('express');
const csvtojson = require('csvtojson');
const mysql = require('mysql');

const app = express();
const port = 3000;

// MySQL database configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'kelp',
});

// Endpoint for converting CSV to JSON and uploading to MySQL
app.post('/upload', async (req, res) => {
  try {
    console.log(process.env.CSV_FILE_PATH); // CSV file path
    const csvFilePath = 'D:/MaanyaJogani/Interviews/KelpSoftware/CsvFiles/personDetails.csv'; // CSV file path
    const jsonArray = await csvtojson().fromFile(csvFilePath); // Convert CSV to JSON

    console.log(jsonArray);
    // Map mandatory properties to designated fields and put remaining ones to additional_info field
    const mappedJsonArray = jsonArray.map((data) => {

      // check if mandatory fields are present
      if (!data.name.firstName || !data.name.lastName || !data.age) {
        res.statusCode = 400;
        res.end('Error: Mandatory fields missing');
        return;
      }

      let { name, age, ...additional_info } = { ...data };
      console.log(name, age, additional_info);
      let person = {
        firstName: data.name.firstName,
        lastName: data.name.lastName,
        age,
        additional_info: JSON.stringify(additional_info)
      };

      return person;

    });

    console.log(mappedJsonArray);

    // Insert JSON data into MySQL table
    mappedJsonArray.forEach((person) => {
      connection.query('INSERT INTO person SET ?', person);
    });

    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});