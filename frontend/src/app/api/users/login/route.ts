import { NextRequest, NextResponse } from "next/server";
import apiClient from "../../api-client";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const response = await apiClient.post("/users/login", body);
  return NextResponse.json(response);
}
