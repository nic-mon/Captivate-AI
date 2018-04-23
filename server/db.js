///// db stuff 

var connectionName = 'capai-198619:us-west1:capsql';
var rootPwd = 'CaptivateAI';

// Replace these variables in this block with real values.
var user = 'user_name';
var userPwd = 'user_password';

//name of db
var db = 'content';

var root = 'root';
var instanceUrl = 'jdbc:google:mysql://' + connectionName;
var dbUrl = instanceUrl + '/' + db;


function readQuotes() {
    var conn = Jdbc.getCloudSqlConnection(dbUrl, root, rootPwd);
    var stmt = conn.createStatement();
    stmt.setMaxRows(1000);

    var results = stmt.executeQuery('SELECT * FROM quotes');

    quotes = [];

    while (results.next()) {
        var quoteString = '"' + results.getString(2) + '" -' + results.getString(1);
        quotes.push(quoteString);
    }

    results.close();
    stmt.close();

    return quotes;
}

// functions below from how-to-guide

// Create a new database within a Cloud SQL instance.
function createDatabase(db_name) {
    var conn = Jdbc.getCloudSqlConnection(instanceUrl, root, rootPwd);
    conn.createStatement().execute('CREATE DATABASE ' + db_name);
}

// Create a new user for your database with full privileges.
function createUser() {
    var conn = Jdbc.getCloudSqlConnection(dbUrl, root, rootPwd);

    var stmt = conn.prepareStatement('CREATE USER ? IDENTIFIED BY ?');
    stmt.setString(1, user);
    stmt.setString(2, userPwd);
    stmt.execute();

    conn.createStatement().execute('GRANT ALL ON `%`.* TO ' + user);
}

// Create a new table in the database.
function createTable() {
    var conn = Jdbc.getCloudSqlConnection(dbUrl, root, rootPwd);
    conn.createStatement().execute('CREATE TABLE quotes '
        + '(author VARCHAR(255), quote VARCHAR(2000), '
        + 'entryID INT NOT NULL AUTO_INCREMENT, PRIMARY KEY(entryID));');
}

////////// write

// Write one row of data to a table.
function writeOneRecord(auth, quo) {
    var conn = Jdbc.getCloudSqlConnection(dbUrl, root, rootPwd);

    var stmt = conn.prepareStatement('INSERT INTO quotes '
        + '(author, quote) values (?, ?)');
    stmt.setString(1, auth);
    stmt.setString(2, quo);
    stmt.execute();
}

/*
  Create a table to store the responses to the User Survey (at the Start Screen)
 */
function createSurveyTable() {
    var conn = Jdbc.getCloudSqlConnection(dbUrl, root, rootPwd);
    conn.createStatement().execute('CREATE TABLE IF NOT EXISTS survey '
        + '(audience VARCHAR(255), minutes INT, goal VARCHAR(255), '
        + 'gain VARCHAR(255), '
        +  'entryID INT NOT NULL AUTO_INCREMENT, PRIMARY KEY(entryID));');
}

////////// write

// Write one row of data to a table.
function answerSurvey(aud, min, goal, gain) {
    Logger.log(aud);
    Logger.log(min);
    Logger.log(goal);
    Logger.log(gain);
    var conn = Jdbc.getCloudSqlConnection(dbUrl, root, rootPwd);

    var stmt = conn.prepareStatement('INSERT INTO survey '
        + '(audience, minutes, goal, gain) values (?, ?, ?, ?)');

    stmt.setString(1, aud);
    stmt.setString(2, min);
    stmt.setString(3, goal);
    stmt.setString(4, gain);
    stmt.execute();
}

function readSurvey() {
    var conn = Jdbc.getCloudSqlConnection(dbUrl, root, rootPwd);
    var stmt = conn.createStatement();
    stmt.setMaxRows(1000);

    var results = stmt.executeQuery('SELECT * FROM survey');

    quotes = [];

    while (results.next()) {
        var quoteString = '"' + results.getString(1) + '" -' + results.getString(4);
        quotes.push(quoteString);
    }

    results.close();
    stmt.close();





    Logger.log(quotes);
    Logger.log('bookend');
    //Logger.log('Time elapsed: %sms', end - start);
}

// Write 500 rows of data to a table in a single batch.
function writeManyRecords() {
    var conn = Jdbc.getCloudSqlConnection(dbUrl, user, userPwd);
    conn.setAutoCommit(false);

    var start = new Date();
    var stmt = conn.prepareStatement('INSERT INTO entries '
        + '(guestName, content) values (?, ?)');
    for (var i = 0; i < 500; i++) {
        stmt.setString(1, 'Name ' + i);
        stmt.setString(2, 'Hello, world ' + i);
        stmt.addBatch();
    }

    var batch = stmt.executeBatch();
    conn.commit();
    conn.close();

    var end = new Date();
    Logger.log('Time elapsed: %sms for %s rows.', end - start, batch.length);
}

///////////////////// read 

// Read up to 1000 rows of data from the table and log them.
function readFromTable() {
    var conn = Jdbc.getCloudSqlConnection(dbUrl, user, userPwd);

    var start = new Date();
    var stmt = conn.createStatement();
    stmt.setMaxRows(1000);
    var results = stmt.executeQuery('SELECT * FROM entries');
    var numCols = results.getMetaData().getColumnCount();

    while (results.next()) {
        var rowString = '';
        for (var col = 0; col < numCols; col++) {
            rowString += results.getString(col + 1) + '\t';
        }
        Logger.log(rowString)
    }

    results.close();
    stmt.close();

    var end = new Date();
    Logger.log('Time elapsed: %sms', end - start);
}