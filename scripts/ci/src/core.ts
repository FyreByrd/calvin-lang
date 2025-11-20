export type Task = () => void | Promise<void>;

export interface Step {
  id: string;
  run: Task;
  postRun: Task;
}

