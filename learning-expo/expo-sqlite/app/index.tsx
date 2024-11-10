import { Text, View } from "react-native";
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite'

// Initialize Database
async function initializeDatabase(db){
  try{
    await db.execASync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS Categories(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        source_type TEXT NOT NULL CHECK(source_type IN ('Expense', 'Income'))
      );

      CREATE TABLE IF NOT EXISTS Transactions(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        amount REAL NOT NULL,
        date INTEGER NOT NULL,
        source_type TEXT NOT NULL CHECK (type IN ('Expense', 'Income')),
        FOREIGN KEY (category_id) REFERENCES Categories(id)
      );
    `)
  }
  catch(error){
    console.log('Error while initializing.')
  }
}

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
