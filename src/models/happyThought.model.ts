import { Table, 
    Column,
     Model, 
     PrimaryKey, 
     AutoIncrement, 
     Default, 
     ForeignKey, 
     BelongsTo, 
     AllowNull, 
     Unique, 
     IsDate, 
     IsBefore, 
     IsAfter, 
     Max, 
     Min, 
     CreatedAt, 
     UpdatedAt, 
     Length,
     BelongsToMany,
     IsEmail,
     BeforeCreate,
     Validate} from 'sequelize-typescript';
import {DataType} from 'sequelize-typescript';
import { Sequelize, GEOMETRY } from 'sequelize/types';
import { modelInterface, geoJSON } from '../../types/types'
import { Col } from 'sequelize/types/lib/utils';
const uuidv1 = require('uuid/v1');


export type IhappyThought = modelInterface<happyThought>;

@Table
export class happyThought extends Model<happyThought> {

    static formatDate(date : Date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;

        return [year, month, day].join('-');
    }


    @Default(uuidv1)
    @AllowNull(false)
    @Unique
    @Column({ type : DataType.UUID, primaryKey: true, unique: true  })
    thoughtID?: string;

    @AllowNull(false)
    @Column
    postedBy: string;

    @AllowNull(false)
    @Length({max:255,min:10})
    @Column({type:DataType.STRING})
    thoughtText : string;

    @CreatedAt
    @Column
    createdAt? : Date;

    @UpdatedAt
    @Column
    updatedAt?: Date;

    
    
}

