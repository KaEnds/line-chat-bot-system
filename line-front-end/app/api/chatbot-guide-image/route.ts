import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
    try {
        const imagePath = path.join(process.cwd(), "images", "chatbot_guide.png");
        const imageBuffer = await readFile(imagePath);

        return new Response(imageBuffer, {
            status: 200,
            headers: {
                "Content-Type": "image/png",
                "Content-Disposition": "inline; filename=chatbot_guide.png",
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch (error) {
        console.error("Error reading chatbot guide image:", error);
        return Response.json(
            {
                message: "chatbot_guide.png not found",
            },
            {
                status: 404,
            }
        );
    }
}
