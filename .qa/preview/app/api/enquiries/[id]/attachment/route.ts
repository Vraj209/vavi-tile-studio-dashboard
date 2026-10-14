import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "00000000-0000-4000-8000-000000000001") {
    const image = await readFile(path.join(process.cwd(), ".qa", "preview", "preview-image.png"));
    return new Response(new Uint8Array(image), { headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="inspiration-${id}.png"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  }
  return Response.json({ message: "Synthetic attachment failure for QA. Please try again." }, {
    status: 503,
    headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
  });
}
