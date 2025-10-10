import type { WorkerId } from "./spawnWorker.ts"

type Epoch = number

type WorkerError = {
  datetime: Epoch
  error: ErrorEvent
}

export type WorkerStatus = {
  workerId: WorkerId
  errors: WorkerError[]
  start: Epoch
  attempts: number
}

export type WorkerPoolStatus = {
  start: Epoch
  workers: WorkerStatus[]
  totalAttempts: number
  attemptsPerSecond: number
}

export const createWorkerPoolStatus = () : WorkerPoolStatus => {
  return {
    start: Date.now(),
    workers: [],
    totalAttempts: 0,
    attemptsPerSecond: 0
  }
}

export const updateWorkerPoolStatus = (workerPoolStatus: WorkerPoolStatus, workerStatus: WorkerStatus) : WorkerPoolStatus => {
  const index = workerPoolStatus.workers.findIndex(w => w.workerId === workerStatus.workerId)
  workerPoolStatus.workers[index] = workerStatus
  workerPoolStatus.totalAttempts = workerPoolStatus.workers.reduce((a, b) => a + b.attempts, 0)
  const secondsElapsed = (Date.now() - workerPoolStatus.start) / 1000
  workerPoolStatus.attemptsPerSecond = Math.round(workerPoolStatus.totalAttempts / secondsElapsed)
  return workerPoolStatus
}