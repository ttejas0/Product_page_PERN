import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

//This create a SQL connection using our env variables
export const sql = neon(
  `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`
);
// this sql function we export is used as tagged template litral, which allows us to write SQL more safely

//postgresql://neondb_owner:npg_xnUDsF20uCVM@ep-late-recipe-a8blmyhh-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
