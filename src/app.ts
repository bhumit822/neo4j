import express from "express";
import neo4j,{Driver,Session} from "neo4j-driver";
import bodyParser from 'body-parser';
const app = express();
const port = 4000;

const driver:Driver =neo4j.driver("bolt://192.168.1.10:7687",neo4j.auth.basic('neo4j',"12345678"))

app.use(bodyParser.json())
const session: Session = driver.session();
app.get("/", (req, res) => {
  res.send("Hello Wo---->rld!");
});

app.post("/add",(req,res)=>{
  session
  .run(`
    CREATE (person:Person {name: $name, age: $age})
    CREATE (movie:Movie {title: $title, year: $year})
    CREATE (person)-[:LIKES]->(movie)
    CREATE (movie)-[:LIKES]->(person)
  `, { name: req.body.name, age:req.body.age, title: req.body.title, year: req.body.year })
  .then(() =>{ console.log('Data added successfully');
res.status(201).send("success");})
  .catch((error) => console.error(error))
  .finally(() => {
    // session.close();
    // driver.close();
  });

});


app.get("/get",async (req,res)=>{

 var result = await session.run('MATCH (n:Person) RETURN n');

 res.status(200).send(result.records.map(e=>e.get('n').properties));
//  session.close();

});
app.post("/getPersonLikes",async (req,res)=>{
var name=req.body.name;
 var result = await session.run('MATCH (n:Person)-[:LIKES]->(m:Movie) WHERE n.name=$name AND n.age=$age RETURN ID(m) as id,m ',{name:name,age:req.body.age});

 res.status(200).send(result.records.map(e=>{return{...e.get('m').properties,id:e.get('id').toString()};}));
//  session.close();

});


app.put("/update",async(req,res)=>{
var _name=req.body.name;
var age=req.body.age;
 await session.run("MATCH (n:Person) WHERE n.name = $name  SET n.age=$age RETURN n",{name: _name,age:age});

 res.status(200).send("success")
//  session.close();
});
app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
// app.listen(port, () => {
//   return console.log(`Express is listening at http://localhost:${port}`);
// }).close(()=>{session.close();
// driver.close();});
