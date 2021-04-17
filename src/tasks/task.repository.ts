import { User } from './../auth/user.entity';
import { GetTaskFilterDTO } from './dto/get-task-filter.dto';
import { CreateTaskDTO } from './dto/create-task.dto';
import { EntityRepository, Repository } from "typeorm";
import { Task } from "./task.entity";
import { TaskStatus } from './task-status.enum';
import { InternalServerErrorException, Logger } from '@nestjs/common';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TaskRepository')

  async getTasks(filterDTO: GetTaskFilterDTO, user: User): Promise<Task[]> {
    const { status, search } = filterDTO
    const query = this.createQueryBuilder('task')

    query.where('task.userId = :userId', { userId: user.id })

    if(status) {
      query.andWhere('task.status = :status', { status })
    }

    if(search) {
      query.andWhere('task.title LIKE :search OR task.description LIKE :search', { search: `%${search}%` })
    }

    try {
      const tasks = await query.getMany()
      return tasks
    } catch (error) {
      this.logger.error(`Failed while fetching tasks for user "${user.username}"`, error.stack)
      throw new InternalServerErrorException()
    }
    
  }

  async createTask(createTaskDTO: CreateTaskDTO, user: User): Promise<Task> {
    const { title, description } = createTaskDTO

    const task = new Task()
    task.title = title
    task.description = description
    task.status = TaskStatus.OPEN
    task.user = user
    await task.save()

    delete task.user

    return task 
  }
}