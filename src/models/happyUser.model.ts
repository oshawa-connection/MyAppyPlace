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
import { modelInterface } from '../../types/types';

const uuidv1 = require('uuid/v1');
var bcrypt = require('bcrypt');

export type IhappyUser = modelInterface<happyUser>;
@Table
export class happyUser extends Model<happyUser> {

    @BeforeCreate
    static encryptPassword(instance: happyUser) {
       const salt = bcrypt.genSaltSync(12)
       instance.password = bcrypt.hashSync(instance.password,salt)
    }
 
    static validPassword(argPassword : string, instance: happyUser) {
       return bcrypt.compareSync(argPassword,instance.password);
    }
    
    @Default(uuidv1)
    @AllowNull(false)
    @Unique
    @Column({ type : DataType.UUID, primaryKey: true, unique: true  })
    userID?: string;

    @AllowNull(false)
    @Column
    userName: string;

    @IsEmail
    @Column
    email : string;
    
    @Length({min:5,max:50})
    @Column({ allowNull:false })
    password : string;

    @Column
    profilePicture?: string;

    @CreatedAt
    @Column
    createdAt? : Date;

    @UpdatedAt
    @Column
    updatedAt?: Date;


    
}
