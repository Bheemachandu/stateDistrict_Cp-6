const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());
dbPath = path.join(__dirname, "covid19India.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at https://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//1)Returns a list of all states in the state table
app.get("/states/", async (request, response) => {
  const getStatesList = `SELECT * FROM state;`;
  const stateList = await db.all(getStatesList);
  response.send(
    stateList.map(function (item) {
      return {
        stateId: item.state_id,
        stateName: item.state_name,
        population: item.population,
      };
    })
  );
});

//2)Returns a state based on the state ID
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getQuery = `SELECT * FROM state WHERE state_id="${stateId}";`;
  const stateDetails = await db.get(getQuery);
  response.send({
    stateId: stateDetails.state_id,
    stateName: stateDetails.state_name,
    population: stateDetails.population,
  });
});

//3)Create a district in the district table, district_id is auto-incremented

app.post("/districts/", async (request, response) => {
  const requestBody = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = requestBody;
  const postQuery = `INSERT INTO district(district_name,state_id,cases,cured,active,deaths) VALUES ("${districtName}",${stateId},${cases},${cured},${active},${deaths});`;
  await db.run(postQuery);
  response.send("District Successfully Added");
});

//4)Returns a district based on the district ID
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getQuery = `SELECT * FROM district WHERE district_id="${districtId}";`;
  const districtDetails = await db.get(getQuery);
  response.send({
    districtId: districtDetails.district_id,
    districtName: districtDetails.district_name,
    stateId: districtDetails.state_id,
    cases: districtDetails.cases,
    cured: districtDetails.cured,
    active: districtDetails.active,
    deaths: districtDetails.deaths,
  });
});

//5)Returns a district based on the district ID
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteQuery = `DELETE FROM district WHERE district_id = ${districtID};`;
  await db.run(deleteQuery);
  response.send("District Removed");
});
