import express from "express"
const helmet = require('helmet');
import { Request, Response, NextFunction } from "express";
import { sequelizeFactory } from "./database";
import { happyThought, IhappyThought } from "../models/happyThought.model"


export const sequelize = sequelizeFactory(process.env.NODE_ENV);
sequelize.sync({force:false});

const bodyParser = require('body-parser');
const port = 3002;
export const server = express();

server.use(helmet())

const hostname = "localhost"
console.log(__dirname +"/../views/")


server.use("/views",express.static(__dirname +"/../views/"));
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.set('view engine', 'ejs');

server.use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS,   PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the   requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', "false");
    // Pass to next layer of middleware
    next();
  });

server.get("/",async (req:Request,res:Response) => {
  res
    .redirect("/viewThoughts")
})

server.get("/viewThoughts", async (req:Request,res:Response) => {
  
  let thoughts = await happyThought.findAll()
  let rawThoughtData = thoughts.map( (d:any) => {return d.dataValues})
  console.log(rawThoughtData)
  res
    .render(__dirname + '/../../../views/displayThoughts.ejs',{thoughts:rawThoughtData});   
})

server.get("/newThought",async (req:Request,res:Response) => {
  res
    .render(__dirname + '/../../../views/form.ejs')
})

server.post("/newThought",async (req:Request,res:Response) => {
  let requestedThought : IhappyThought = {
    thoughtText:req.body.thoughtText,
    postedBy: req.body.postedBy
  };

  let newHappyThought = new happyThought(requestedThought);
  newHappyThought.validate().then(
    (msg) => {
      console.log("inputs good")
      happyThought.create(requestedThought).then( (msg2) =>
        res
          .redirect("/viewThoughts")
      ).catch((err) => {

        console.error('couldnt create new happy thought')
        console.error(err)
        res
          .render(__dirname + '/../../../views/error.ejs');   
      })

    }
  ) .catch( (err) => {
    console.error(err)
    res
      .render(__dirname + '/../../../views/error.ejs');   
  })
  
  
})

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

