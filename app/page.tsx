"use client";

import {type ChangeEvent, type SubmitEvent, useEffect, useState} from "react";
import axios from "axios";

  type Task = {

    id: number;
    title: string;
    description: string;
    dueDate: string;
    createdAt: string;
    completed: boolean;
  };

  type SortOrder = "asc" | "desc";

 export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  function sortTasks(tasksToSort: Task[], order: SortOrder) {
    return [...tasksToSort].sort((firstTask, secondTask) => {
      const dateDifference =
        new Date(firstTask.dueDate).getTime() -
        new Date(secondTask.dueDate).getTime();

      return order === "asc" ? dateDifference : -dateDifference;
    });
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("title");
    const description = formData.get("description");
    const dueDate = formData.get("dueDate");

    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof dueDate !== "string"
    ) {
      return;
    }
  
    try {
      const response = await axios.post<Task>("/api/tasks", {
        title,
        description,
        dueDate,
      });

      setTasks((currentTasks) =>
        sortTasks(
          [...currentTasks, response.data],
          sortOrder,
        ),
      );
      form.reset();
    } catch (error) {
      console.error("Could not create task:", error);
    }
  }
    async function handleToggleComplete(task: Task) {
      try {
        const response = await axios.patch<Task>(
          `/api/tasks/${task.id}`,
          {
            completed: !task.completed,
          },
        );
  
        setTasks((currentTasks) =>
          currentTasks.map((currentTask) =>
            currentTask.id === response.data.id
              ? response.data
              : currentTask,
          ),
        );
      } catch (error) {
        console.error("Could not update task:", error);
  }
}
async function handleDeleteTask(task: Task) {
  try {
    await axios.delete<Task>(`/api/tasks/${task.id}`);

    setTasks((currentTasks) =>
      currentTasks.filter(
        (currentTask) => currentTask.id !== task.id,
      ),
    );
  } catch (error) {
    console.error("Could not delete task:", error);
  } finally {
    console.log("Request completed");
  }
}
function startEditing(task: Task) {
  setEditingTask(task);
}
async function handleSaveEdit(
  event: SubmitEvent<HTMLFormElement>,
  taskId: number,
) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);

  const title = formData.get("title");
  const description = formData.get("description");
  const dueDate = formData.get("dueDate");

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof dueDate !== "string"
  ) {
    return;
  }

  try {
    const response = await axios.patch<Task>(
      `/api/tasks/${taskId}`,
      { title, description, dueDate },
    );

    setTasks((currentTasks) =>
      sortTasks(
        currentTasks.map((currentTask) =>
          currentTask.id === response.data.id
            ? response.data
            : currentTask,
        ),
        sortOrder,
      ),
    );

    setEditingTask(null);
  } catch (error) {
    console.error("Could not save task changes:", error);
  }
}

async function handleSortChange(
  event: ChangeEvent<HTMLSelectElement>,
) {
  const newOrder: SortOrder =
    event.target.value === "desc" ? "desc" : "asc";

  setSortOrder(newOrder);

  try {
    const response = await axios.get<Task[]>(
      `/api/tasks?sortBy=dueDate&order=${newOrder}`,
    );

    setTasks(response.data);
  } catch (error) {
    console.error("Could not sort tasks:", error);
  }
}

  useEffect(() => {
    async function getTasks() {
      const response = await axios.get<Task[]>(
        "/api/tasks?sortBy=dueDate&order=asc",
      );

      setTasks(response.data);
      
    }

    getTasks();
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-[#FEEBE7] font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-6xl flex-col items-center justify-between py-32 px-16 bg-[#FEEBE7] sm:items-start">

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            My tasks
          </h1> 
          <div className="mt-6 grid w-full gap-8 md:grid-cols-2">
          <div className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          <form   onSubmit={handleSubmit}
          className="flex max-w-md flex-col gap-4">
    <div>
      <label htmlFor="title">Task name</label>
      <input
        id="title"
        name="title"
        type="text"
        required
        className="w-full rounded border p-2"
      />
    </div>

    <div>
      <label htmlFor="description">Description</label>
      <textarea
        id="description"
        name="description"
        required
        className="w-full rounded border p-2"
      />
    </div>

    <div>
      <label htmlFor="dueDate">Due date</label>
      <input
        id="dueDate"
        name="dueDate"
        type="date"
        required
        className="w-full rounded border p-2"
      />
    </div>

    <button
      type="submit"
      className="rounded bg-[#A2F4FD] px-4 py-2 font-semibold text-black hover:bg-[#4DB8EB]"
    >
      Add task
    </button>
  </form> 
  <div className="mt-8 w-full max-w-md">
    <label htmlFor="sortOrder">Sort by due date</label>

    <select
      id="sortOrder"
      value={sortOrder}
      onChange={handleSortChange}
      className="mt-1 w-full rounded border border-[#FAA18F] bg-[#FAA18F] p-2 text-black"
    >
      <option value="asc">Earliest first</option>
      <option value="desc">Latest first</option>
    </select>
  </div>
</div>
  <section className="w-full">
    <h2 className="text-2xl font-semibold">Your tasks</h2>

    {tasks.length === 0 ? (
      <p className="mt-2">No tasks yet.</p>
    ) : (
      <ul className="mt-4 flex flex-col gap-3">
        {tasks.map((task) => (
          <li key={task.id} className="rounded border p-4">
            <h3 className="font-semibold">{task.title}</h3>
            <p>{task.description}</p>
            <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
            <p>
              {task.completed ? "Completed" : "Not completed"}
            </p>
          <div className="mt-3 flex flex-col gap-2"> 
            <button
              type="button"
              onClick={() => handleToggleComplete(task)}
                  className="rounded bg-[#86EFAC] px-4 py-2 font-semibold text-green-950 hover:bg-[#6EE7A0]"
            >
              {task.completed ? "Mark incomplete" : "Mark complete"}
            </button>


            <button
              type="button"
              onClick={() => handleDeleteTask(task)}
              className="rounded border-2 border-rose-300 bg-[radial-gradient(circle_at_center,_white_45%,_#fff1f2_100%)] px-4 py-2 font-semibold text-rose-500 hover:brightness-95"

            >
              Delete task
            </button>

            {editingTask?.id === task.id ? (
              <form 
                onSubmit={(event) => handleSaveEdit(event, task.id)}
                className="mt-3 flex flex-col gap-2"
              >
                <input
                  name="title"
                  defaultValue={task.title}
                  required
                  className="rounded border p-2"
                />
       
                <textarea
                  name="description"
                  defaultValue={task.description}
                  required
                  className="rounded border p-2"
                />
       
                <input
                  name="dueDate"
                  type="date"
                  defaultValue={task.dueDate.slice(0, 10)}
                  required
                  className="rounded border p-2"
                />
       
                <button type="submit">Save changes</button>
            
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => startEditing(task)}
                className="rounded border-2 border-violet-300 bg-[radial-gradient(circle_at_center,_white_45%,_#f5f3ff_100%)] px-4 py-2 font-semibold text-violet-500 hover:brightness-95"
              >
                Edit task
              </button>
            )}
          </div>
          </li>
        ))}
      </ul>
    )}
  </section>   
          </div>
        </div>
       
      </main>
    </div>
  );
}
