import { getBookDetailsByTitleInLibrary } from "@/lib/db";
import { get } from "http";

export async function POST(request: Request) {
    try {

        const data = await request.json();
        
        if(data) {
            if (data.isInLibrary === "true") {
                const bookDetails = await getBookDetailsByTitleInLibrary(data.title);
                return new Response(JSON.stringify({ message: "Success", bookDetails }), { status: 200 });
            }else {
                const bookDetails = await getBookDetailsByTitleInLibrary(data.title);
                return new Response(JSON.stringify({ message: "Success", bookDetails }), { status: 200 });  
            }
        }
        return new Response(JSON.stringify({ message: "Success", data }), { status: 200 });
    } catch (error) {
        console.error('Error handling POST request:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Response(JSON.stringify({ message: "Error", error: errorMessage }), { status: 500 });
    }

}