import { NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST(req: Request) {
  const { teams, slots } = await req.json();

  const py = spawn("python3", ["solver/schedule_solver.py"]);

  const result = await new Promise<any>((resolve, reject) => {
    let out = "";
    let err = "";

    py.stdout.on("data", d => (out += d.toString()));
    py.stderr.on("data", d => (err += d.toString()));

    py.on("close", code => {
      if (code !== 0) return reject(err);
      resolve(JSON.parse(out));
    });

    py.stdin.write(JSON.stringify({ teams, slots }));
    py.stdin.end();
  });

  return NextResponse.json(result);
}
