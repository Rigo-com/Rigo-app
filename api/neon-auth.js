import {neon} from "@neondatabase/serverless";
export default async function handler(req,res){return res.status(200).json({ok:true,probe:"neon-import"})}
