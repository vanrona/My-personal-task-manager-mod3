"use client";

import {type ChangeEvent, type SubmitEvent, useEffect, useState} from "react";
import axios from "axios";
import Image from "next/image";

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
  const [showCelebration, setShowCelebration] = useState(false);

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
        if (!task.completed && response.data.completed) {
          setShowCelebration(true);
        }
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

        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <h1 className="flex items-center gap-3 text-3xl font-semibold leading-10 tracking-tight text-black">
    <Image
      src="/image/taskerra-logo.png"
      alt="Taskérra butterfly logo"
      width={48}
      height={48}
    />
    Taskérra
  </h1>
          <p><i> Keeping track of your tasks so that you don&apos;t have to.</i></p>
          <div className="mt-6 grid w-full gap-8 md:grid-cols-2">
          <div  className="w-full max-w-md rounded-xl border border-zinc-300 bg-[#FFFDF7] p-6 text-lg leading-8 text-zinc-600 shadow-[0_8px_0_#d4d4d8,0_14px_24px_rgba(0,0,0,0.12)]">
          <form   onSubmit={handleSubmit}
          className="flex max-w-md flex-col gap-4">
    <div>
      <label htmlFor="title">Task name</label>
      <input
        id="title"
        name="title"
        type="text"
        required
         className="w-full rounded border p-2 outline-none focus:border-[#E85D83] focus:ring-2 focus:ring-[#E85D83]/30"
      />
    </div>

    <div>
      <label htmlFor="description">Description</label>
      <textarea
        id="description"
        name="description"
        required
         className="w-full rounded border p-2 outline-none focus:border-[#E85D83] focus:ring-2 focus:ring-[#E85D83]/30"
      />
    </div>

    <div>
      <label htmlFor="dueDate">Due date</label>
      <input
        id="dueDate"
        name="dueDate"
        type="date"
        required
         className="w-full rounded border p-2 outline-none focus:border-[#E85D83] focus:ring-2 focus:ring-[#E85D83]/30"
      />
    </div>

    <button
      type="submit"
      className="rounded-lg border-2 border-[#d97f6e] bg-[#FAA18F] px-4 py-3 font-semibold text-black shadow-sm transition hover:bg-[#e98c7b] hover:shadow-md"
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
      className="mt-1 w-full rounded-lg border-2 border-[#d97f6e] bg-[#FAA18F] p-3 text-black shadow-sm outline-none focus:border-[#E85D83] focus:ring-2 focus:ring-[#E85D83]/40"
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
          <li key={task.id}
          className="rounded-xl border border-zinc-300 bg-[#FFFDF7] p-5 shadow-[0_8px_0_#d4d4d8,0_14px_24px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-1">
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
                  className="rounded bg-[#86D7B0] px-4 py-2 font-semibold text-green-950 hover:bg-[#72C59D]"
            >
              {task.completed ? "Mark incomplete" : "Mark complete"}
            </button>


            <button
              type="button"
              onClick={() => handleDeleteTask(task)}
              className="rounded border-2 border-[#D95770] bg-[radial-gradient(circle_at_center,_white_40%,_#F9D5DC_100%)] px-4 py-2 font-semibold text-[#A62E49] transition hover:brightness-95"

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
                className="rounded border-2 border-[#FF8904] bg-[radial-gradient(circle_at_center,_white_45%,_#fff3e0_100%)] px-4 py-2 font-semibold text-[#c95e00] hover:brightness-95"
                 
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
      {showCelebration && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-4 shadow-xl">
        <button
          type="button"
          onClick={() => setShowCelebration(false)}
          className="absolute right-2 top-2 rounded px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-100"
        >
          Close
        </button>

        <video
          src="/videos/celebration.mp4"
          autoPlay
          controls
          playsInline
          onEnded={() => setShowCelebration(false)}
          className="w-full rounded"
        />
      </div>
    </div>
  )}
    </div>
  );
}
