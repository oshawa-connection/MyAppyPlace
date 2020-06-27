import { Router } from 'express';
import { Request, Response, NextFunction } from "express";
import { happyThought, IhappyThought } from "../models/happyThought.model"
import { happyUser, IhappyUser } from "../models/happyUser.model";
import { sequelize } from '../server';


export const searchRouter = Router();

searchRouter.post('/displayResults', async (req:Request,res:Response)=>{
    console.log("Router router.");
    console.log(`Search term is: ${req.body.searchTerm}`);

    const searchResults = await sequelize.query(`
    SELECT *
    FROM ${happyThought.tableName}
    WHERE _search @@ plainto_tsquery('english', :searchTerm);
    `, {
    model: happyThought,
    replacements: { searchTerm: req.body.searchTerm },
    });

    res.render("searchResults.ejs",{searchTerm:req.body.searchTerm,thoughts:searchResults})
})


