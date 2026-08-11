import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany, create, update, remove } = vi.hoisted(() => ({
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    task: {
      findMany,
      create,
      update,
      delete: remove,
    },
  },
}));

import { GET, POST } from "@/app/api/tasks/route";
import { DELETE, PATCH } from "@/app/api/tasks/[id]/route";

const exampleTask = {
  id: 1,
  title: "Morning exercise",
  description: "Go for a run",
  dueDate: new Date("2026-08-06"),
  createdAt: new Date("2026-08-01"),
  completed: false,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("tasks API", () => {
  it("gets tasks sorted by due date", async () => {
    findMany.mockResolvedValue([exampleTask]);

    const response = await GET(
      new NextRequest("http://localhost/api/tasks?sortBy=dueDate&order=asc"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toHaveLength(1);
    expect(findMany).toHaveBeenCalledWith({
      orderBy: { dueDate: "asc" },
    });
  });

  it("rejects an invalid sort query", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/tasks?sortBy=title&order=asc"),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Use sortBy=dueDate and order=asc or order=desc.",
    });
    expect(findMany).not.toHaveBeenCalled();
  });

  it("creates a task when all required fields are supplied", async () => {
    create.mockResolvedValue(exampleTask);
    const request = new NextRequest("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: "Morning exercise",
        description: "Go for a run",
        dueDate: "2026-08-06",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith({
      data: {
        title: "Morning exercise",
        description: "Go for a run",
        dueDate: new Date("2026-08-06"),
      },
    });
  });

  it("rejects a task with missing required fields", async () => {
    const request = new NextRequest("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "Morning exercise" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("updates a task's completion status", async () => {
    update.mockResolvedValue({ ...exampleTask, completed: true });
    const request = new NextRequest("http://localhost/api/tasks/1", {
      method: "PATCH",
      body: JSON.stringify({ completed: true }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "1" }),
    });

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { completed: true },
    });
  });

  it("deletes a task by its id", async () => {
    remove.mockResolvedValue(exampleTask);

    const response = await DELETE(
      new NextRequest("http://localhost/api/tasks/1", { method: "DELETE" }),
      { params: Promise.resolve({ id: "1" }) },
    );

    expect(response.status).toBe(200);
    expect(remove).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
