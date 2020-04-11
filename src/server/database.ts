var fs = require('fs');
var path = require('path');
import { Sequelize } from 'sequelize-typescript';
import { happyThought } from '../models/happyThought.model';

export function sequelizeFactory(sequelizeEnvironment = "testing") {
  
  let config : any;

  try {
    config = require(__dirname + '/../../database.config.json')[sequelizeEnvironment];
  }
  catch (err) {
    config = require(__dirname + '/../../../database.config.json')[sequelizeEnvironment];
  }


  var db = <any>{};

  let loggingOption;
  switch (config.logging) {
    case false:
      loggingOption = false;
      break;
    case true:
      loggingOption = console.log;
      break;
    default:
      loggingOption = console.log;
      break;
  };

  const sequelize = new Sequelize({
    database: config.database || process.env.database,
    dialect: config.dialect || "postgres",
    username: config.username || process.env.user,
    password: config.password || process.env.dbPassword,
    host: config.host || process.env.host,
    port: config.port || "5432",
    logging:loggingOption ,
    define: {
      schema: config.schema,
      freezeTableName: true,
      timestamps: true,
    }
  });

  sequelize.authenticate().then(() => {
    console.log('connection successful.')
  })
    .catch((err) => {
      console.log(err);
    })

  // sequelize.addModels([__dirname + '/**/*.model.ts']);

  sequelize.addModels([happyThought]);
  return sequelize;
}


if (!module.parent) {
  // if this file is being run as a script
  var sequelize = sequelizeFactory("testing")
  sequelize.sync({force:true})
}