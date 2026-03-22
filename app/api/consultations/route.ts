import { NextRequest } from "next/server";
import {
  createConsultationController,
  listConsultationsController,
} from "@/lib/modules/consultations/controller";

export async function GET(request: NextRequest) {
  return listConsultationsController(request);
}

export async function POST(request: NextRequest) {
  return createConsultationController(request);
}
