import { defineEntity, p } from "@mikro-orm/core";
import type { InferEntity } from "@mikro-orm/sqlite";

export const UserSchema = defineEntity({
    name:"User",
    properties:{
        id:p.uuid().primary(), 
        firstName:p.string().length(10),
        lastName:p.string().length(10),
        email:p.string()
    }
})

export type IUser = InferEntity<typeof UserSchema>
