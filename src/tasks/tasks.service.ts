import { User } from './../auth/user.entity';
import { TaskRepository } from './task.repository';
import { GetTaskFilterDTO } from './dto/get-task-filter.dto';
import { CreateTaskDTO } from './dto/create-task.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository
  ) {

  }

  async getTasks(filterDTO: GetTaskFilterDTO, user: User): Promise<Task[]> {
    return await this.taskRepository.getTasks(filterDTO, user)
  }

  async getTaskById(id: number, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: {id, userId: user.id } })

    if(!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`)
    }

    return task
  }

  async createTask(createTaskDTO: CreateTaskDTO, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDTO, user)
  }

  async updateTaskStatus(id: number, status: TaskStatus, user: User): Promise<Task> {
    const task = await this.getTaskById(id, user)
    task.status = status
    await task.save()
    return task
  }

  async deleteTask(id: number, user: User): Promise<void> {
    const result = await this.taskRepository.delete({ id, userId: user.id })

    if(result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`)
    }

    return
  }

}
