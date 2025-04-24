import { NextResponse } from "next/server";
import { getJson } from "serpapi";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const results = await getJson({
      engine: "google",
      q: query,
      api_key: process.env.NEXT_PUBLIC_SERPAPI_API_KEY,
    });

    return NextResponse.json({
      success: true,
      results: {
        organic:
          results.organic_results?.map((result: any) => ({
            title: result.title,
            link: result.link,
            snippet: result.snippet,
          })) || [],
        knowledge_graph: results.knowledge_graph
          ? {
              title: results.knowledge_graph.title,
              description: results.knowledge_graph.description,
              attributes: results.knowledge_graph.attributes,
              source: results.knowledge_graph.source,
            }
          : null,
        answer_box: results.answer_box
          ? {
              title: results.answer_box.title,
              answer: results.answer_box.answer,
              snippet: results.answer_box.snippet,
              source: results.answer_box.source,
            }
          : null,
        flight_results: results.flight_results
          ? {
              departure: results.flight_results.departure,
              arrival: results.flight_results.arrival,
              airline: results.flight_results.airline,
              flight_number: results.flight_results.flight_number,
              status: results.flight_results.status,
              scheduled_time: results.flight_results.scheduled_time,
              actual_time: results.flight_results.actual_time,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error searching Google:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search Google" },
      { status: 500 }
    );
  }
}
