///// db stuff 

var connectionName = 'capai-198619:us-west1:capsql';
var rootPwd = 'CaptivateAI';

// Replace these variables in this block with real values.
var user = 'user_name';
var userPwd = 'user_password';

//name of db
var db = 'userdata';

var root = 'root';
var instanceUrl = 'jdbc:google:mysql://' + connectionName;
var dbUrl = instanceUrl + '/' + db;


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

    // uncomment to drop for dev purposes
    //conn.createStatement().execute('DROP TABLE survey');

    conn.createStatement().execute('CREATE TABLE IF NOT EXISTS survey '
        + '(audience VARCHAR(255), minutes INT, goal VARCHAR(255), '
        + 'gain VARCHAR(255), '
        +  'presID VARCHAR(255) NOT NULL, PRIMARY KEY(presID));');
}

/*
  Create a table to store the responses to the Brainstorm (at the Start Screen)
 */
function createBrainstormTable() {
    var conn = Jdbc.getCloudSqlConnection(dbUrl, root, rootPwd);

    // uncomment if need to restart for dev purposes
    //conn.createStatement().execute('DROP TABLE brainstorm');

    conn.createStatement().execute('CREATE TABLE IF NOT EXISTS brainstorm '
        + '(word VARCHAR(100), '
        +  'presID VARCHAR(255) NOT NULL);');
}

////////// write

// Write one row of data to a table.
function answerSurvey(aud, min, goal, gain) {
    Logger.log(aud);
    Logger.log(min);
    Logger.log(goal);
    Logger.log(gain);
    var conn = Jdbc.getCloudSqlConnection(dbUrl, root, rootPwd);

    // drop the table if needed for dev purposes
    // conn.createStatement().execute('DROP TABLE survey');

    // conn.createStatement().execute('CREATE TABLE IF NOT EXISTS survey '
    //     + '(audience VARCHAR(255), minutes INT, goal VARCHAR(255), '
    //     + 'gain VARCHAR(255), '
    //     +  'entryID INT NOT NULL AUTO_INCREMENT, PRIMARY KEY(entryID));');

    // run select stmt and check size of results set
    var presID = SlidesApp.getActivePresentation().getId();

    var results = conn.createStatement().executeQuery('SELECT * FROM survey WHERE presID = "'+presID+'"');

    Logger.log(results);

    var size = 0;
    while (results.next()) {
        size++;
    }

    var presID = SlidesApp.getActivePresentation().getId();

    // presentation ID not already in DB
    if (size == 0) {
        var stmt = conn.prepareStatement('INSERT INTO survey '
            + '(audience, minutes, goal, gain, presID) values (?, ?, ?, ?, ?)');
        stmt.setString(1, aud);
        stmt.setString(2, min);
        stmt.setString(3, goal);
        stmt.setString(4, gain);
        stmt.setString(5, presID);
        stmt.execute();
    }
    else if (size == 1) {
        // var stmt = conn.prepareStatement('UPDATE survey '
        //     + 'SET audience=?, minutes=?, goal=?, gain=?');
        // quick workaround:
        conn.createStatement().execute('DROP TABLE survey;');

        conn.createStatement().execute('CREATE TABLE IF NOT EXISTS survey '
            + '(audience VARCHAR(255), minutes INT, goal VARCHAR(255), '
            + 'gain VARCHAR(255), '
            +  'presID VARCHAR(255) NOT NULL, PRIMARY KEY(presID));');

        var stmt = conn.prepareStatement('INSERT INTO survey '
            + '(audience, minutes, goal, gain, presID) values (?, ?, ?, ?, ?)');
        stmt.setString(1, aud);
        stmt.setString(2, min);
        stmt.setString(3, goal);
        stmt.setString(4, gain);
        stmt.setString(5, presID);
        stmt.execute();

        Logger.log('Error: presID already in db')
    }
    else {
        Logger.log('Error: more than 1 rows with same presID');
    }


}

// insert a word into Brainstorm
// Write one row of data to a table.
function insertWord(word) {
    Logger.log(word);
    var conn = Jdbc.getCloudSqlConnection(dbUrl, root, rootPwd);

    // drop the table if needed for dev purposes
    //conn.createStatement().execute('DROP TABLE brainstorm');

    // conn.createStatement().execute('CREATE TABLE IF NOT EXISTS brainstorm '
    //     + '(word VARCHAR(100), '
    //     +  'presID VARCHAR(255) NOT NULL, PRIMARY KEY(presID));');

    // run select stmt and check size of results set
    var presID = SlidesApp.getActivePresentation().getId();

    var results = conn.createStatement().executeQuery('SELECT * FROM survey WHERE presID = "'+presID+'"');

    Logger.log(results);

    var size = 0;
    while (results.next()) {
        size++;
    }

    var presID = SlidesApp.getActivePresentation().getId();

    // presentation ID not already in DB

    var stmt = conn.prepareStatement('INSERT INTO brainstorm '
        + '(word, presID) values (?, ?)');
    stmt.setString(1, word);
    stmt.setString(2, presID);
    stmt.execute();
}

function readSurvey() {
    var conn = Jdbc.getCloudSqlConnection(dbUrl, root, rootPwd);
    var stmt = conn.createStatement();
    stmt.setMaxRows(1000);

    var presID = SlidesApp.getActivePresentation().getId();

    var results = stmt.executeQuery('SELECT * FROM survey WHERE presID = "'+presID+'"');

    var size = 0;
    var survey = [];
    while (results.next()) {
        size++;
        if (size == 1) {
            survey.push(results.getString(1));
            survey.push(results.getString(2));
            survey.push(results.getString(3));
            survey.push(results.getString(4));
        }
    }

    if (size == 0) {
        Logger.log('No survey found for this presentation');
    }
    else if (size == 1) {
        Logger.log('survey found');
    }
    else {
        Logger.log('More than one survey found for this presentation')
    }

    results.close();
    stmt.close();

    return survey;
}

// Get all words from the brainstorm
function readBrainstorm() {
    var conn = Jdbc.getCloudSqlConnection(dbUrl, root, rootPwd);
    var stmt = conn.createStatement();
    stmt.setMaxRows(1000);

    var presID = SlidesApp.getActivePresentation().getId();

    var results = stmt.executeQuery('SELECT * FROM brainstorm WHERE presID = "'+presID+'"');

    var size = 0;
    var brainstorm = [];
    while (results.next()) {
        size++;
        brainstorm.push(results.getString(1));
    }

    if (size == 0) {
        Logger.log('No brainstorm found for this presentation');
    }
    else if (size == 1) {
        Logger.log('brainstorm found');
    }
    else {
        Logger.log('More than one brainstorm found for this presentation')
    }

    results.close();
    stmt.close();

    return brainstorm;
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