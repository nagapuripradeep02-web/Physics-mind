import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { generateLesson } from "./src/lib/teacherEngine";

async function run() {
    console.log("Starting test...");
    await generateLesson("explain KVL", "chat", "11");
    console.log("Done");
}

run();
