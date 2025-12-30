import { NextResponse } from "next/server";

const getSolverBaseUrl = () => {
  const raw = process.env.SOLVER_BASE_URL;
  if (!raw) return null;
  return raw.replace(/\/$/, "");
};

export async function POST(req: Request) {
  const solverBaseUrl = getSolverBaseUrl();

  if (!solverBaseUrl) {
    return NextResponse.json(
      { error: "SOLVER_BASE_URL is not configured", status: 500 },
      { status: 500 },
    );
  }

  const { teams, slots } = await req.json();

  const solveRes = await fetch(`${solverBaseUrl}/solve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teams, slots }),
  });

  if (!solveRes.ok) {
    const detail = await solveRes.text();
    return NextResponse.json(
      {
        error: "Solver request failed",
        detail,
        status: solveRes.status,
        solverUrl: `${solverBaseUrl}/solve`,
      },
      { status: solveRes.status },
    );
  }

  const result = await solveRes.json();

  return NextResponse.json(result);
}
