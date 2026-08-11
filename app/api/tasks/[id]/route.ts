import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



//   - PATCH /api/tasks/1 — update a task’s details or completion status

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) {
    const { id } = await params;
    const body = await request.json();

    const taskId = Number(id);
    const { title, description, dueDate, completed } = body;

    // validation if statement

    if (Number.isNaN(taskId) || (title === undefined &&
        description === undefined &&
        dueDate === undefined &&
        completed === undefined)) {
        return NextResponse.json(
        { error: "A valid task ID and at lease one editable field are required." },
        { status: 400 },
        );
    }
    const data = {
        ...(typeof title === "string" ? { title } : {}),
        ...(typeof description === "string" ? { description } : {}),
        ...(typeof dueDate === "string" ? { dueDate: new Date(dueDate) } : {}),
        ...(typeof completed === "boolean" ? { completed } : {}),
      };


    const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: data,
    });

    return NextResponse.json(updatedTask);
  }

//   - DELETE /api/tasks/2 — remove a task

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) {
    const { id } = await params;
    const taskId = Number(id);


    const deleteTask = await prisma.task.delete({
        where: {
          id: taskId,
        },
      });
      return NextResponse.json(deleteTask)

    }





