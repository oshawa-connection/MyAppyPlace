import express from "express"
const helmet = require('helmet');
var fs = require('fs');
import { Request, Response, NextFunction } from "express";

import { sequelizeFactory } from "./database";
import { happyThought, IhappyThought } from "../models/happyThought.model"
import { happyUser, IhappyUser } from "../models/happyUser.model";
export const sequelize = sequelizeFactory(process.env.NODE_ENV);

const bodyParser = require('body-parser');


const hostname = "localhost"
const port = process.env.PORT;



const passport = require('passport');
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
import * as jwt from 'jsonwebtoken';
import { start } from "repl";

sequelize.sync({force:false});
export const server = express();

server.use(helmet())




server.use("/views",express.static(__dirname +"/../views/"));
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.set('view engine', 'ejs');

server.use(express.static('static'))

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


server.use(passport.initialize());
server.use(passport.session());

passport.serializeUser(function(user:any, done:any) {
  done(null, user);
});

passport.deserializeUser(function(user :any, done:any) {
  done(null, user);
});

var cookieExtractor = function(req : Request) {
  var token = null;
  if (req.cookies["loginCookie"]) {
    token = req.cookies["loginCookie"]
    return token
  }
  else {
    throw "No cookies sent!"
  }
}

passport.use(new JWTStrategy({
  jwtFromRequest: cookieExtractor,
  secretOrKey   : 'your_jwt_secret'
},
  function (jwtPayload :any, cb:any) {
    console.log(jwtPayload);
    //find the user in db if needed
    return happyUser.findByPk(jwtPayload.userID)
        .then(user => {
            return cb(null, user);
        })
        .catch(err => {
            return cb(err);
        });
  }
));

server.get("/login", (req:Request,res:Response)=>{
  res
          .render(__dirname + '/../../../views/login.ejs');  
})

server.post('/login', function (req :any, res, next) {

  passport.authenticate('jwt', {session: false}, (err:any, user:any, info:any) => {
      // console.log(err);
      // console.log(user);
      if (err || !user) {
        console.log('throwing an error')
        console.log(err)
        res.status(500).send("err")  
        // res.json({
        //       message: info ? info.message : 'Login failed',
        //       user   : user
        //   }).send()
      }
      else {
        req.login(user, {session: false}, (err:any) => {
          if (err) {
              res.send(err);
          }
          else {
            const token = jwt.sign({EmployeeID:user['EmployeeID']}, process.env.jwtSecretKey,{expiresIn: "730hr"});

            res.json(token).send();
          }
        });
      }


  })
  (req, res);

});

server.get('/testAuth/',passport.authenticate('jwt',{ failureRedirect: '/unauthorised'}), (req:Request, res:Response, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain')
  res.end('Hello, Ciao. Gruezi wohl. Du bist an der root der API server...');
});


server.get("newUser", (req:Request,res:Response) => {
  res.render(__dirname + '/../../../views/signUp.ejs',)
})

server.get('/unauthorised',(req:Request,res:Response) => {
  res.status(401).send("Incorrect login info.")
})

server.get("/",async (req:Request,res:Response) => {
  console.log("recieved request")
  res
    .redirect("/viewThoughts")
})

server.get("/viewThoughts", async (req:Request,res:Response) => {
  
  let thoughts = await happyThought.findAll({limit:10,order:[["createdAt","DESC"]]})
  let rawThoughtData = thoughts.map( (d:any) => {return d.dataValues})
  
  res
    .render(__dirname + '/../../../views/displayThoughts.ejs',
        {thoughts:rawThoughtData});   
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

server.get('/heartAscii', async (req:Request,res:Response)=>{
  
  let data : string;
  let filename = __dirname +  '/../../../static/heartAscii.txt'
  fs.readFile(filename, 'utf8', function(err:any, data:string) {
    if (err) throw err;
    console.log('OK: ' + filename);
    console.log(data)
    res.send(data);
  });
  
  
})

server.get('/search', async (req:Request,res:Response)=>{
  res.render("searchForm.ejs");
})


server.post('/search', async (req:Request,res:Response)=>{

  console.log(`Startdate: ${req.body.startDate}`);
  console.log(`EndDate: ${req.body.endDate}`);
  console.log(`searchTerm: ${req.body.searchTerm}`);

  let unParsedStartDate : string = req.body.startDate;
  let unParsedEndDate : string = req.body.endDate;

  let startDate: Date;
  let endDate: Date;

  if (unParsedEndDate == '') {
    
    endDate = new Date(Date.parse('2025-01-01'));
  } else {
    endDate = new Date(Date.parse(req.body.endDate));
  }

  if (unParsedStartDate == '') {
    startDate = new Date(Date.parse('2017-01-01'));
  } else {
    startDate = new Date(Date.parse(req.body.startDate));
  }

  let searchQuery : string;

  if (req.body.searchTerm == '') {
    searchQuery = `
    SELECT *
    FROM "happyThought"
    WHERE "createdAt" <= :endDate AND "createdAt" >= :startDate
    ORDER BY "createdAt" DESC
    LIMIT 20;`;
  } else {
    searchQuery = `
    SELECT *
    FROM "happyThought"
    WHERE _search @@ plainto_tsquery('english', :searchTerm) 
    AND "createdAt" < :endDate AND "createdAt" > :startDate
    ORDER BY ts_rank("_search", to_tsquery('english', :searchTerm)) DESC
    LIMIT 20;`;
  }


  const searchResults = await sequelize.query(searchQuery, {
  model: happyThought,
  replacements: { searchTerm: req.body.searchTerm, endDate : endDate, startDate : startDate },
  });

  res.render("searchResults.ejs",{searchTerm:req.body.searchTerm,thoughts:searchResults})
})

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

