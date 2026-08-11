// easisest thing is to get all records first
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request:NextRequest) {
    const sortBy = request.nextUrl.searchParams.get("sortBy") ?? "dueDate";
    const order = request.nextUrl.searchParams.get("order") ?? "asc";

    if (sortBy !== "dueDate" || (order !== "asc" && order !== "desc")) {
        return NextResponse.json(
          { error: "Use sortBy=dueDate and order=asc or order=desc." },
          { status: 400 },
        );
      }
    const tasks = await prisma.task.findMany({
      orderBy: {
        dueDate: order,
      },
    });

    return NextResponse.json(tasks);
  }

  export async function POST(request: NextRequest) {
    const body = await request.json();

    // validate body
    const { title, description, dueDate } = body;

    if (!title || !description || !dueDate) {
      return NextResponse.json(
        { error: "Title, description, and due date are required." },
        { status: 400 },
      );
    }

    // create with prisma.task.create(...)

    const newTask = await prisma.task.create({
        data: {
          title,
          description,
          dueDate: new Date(dueDate)
        },
      });


    return NextResponse.json(newTask, { status: 201 });
  }