function unavailable() {
  return Response.json({ message: "Authentication is unavailable in the synthetic fixture preview." }, { status: 503 });
}

export const GET = unavailable;
export const POST = unavailable;
