import { TodosAccess } from './todosAcess';
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
//import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'
//import { TodoUpdate } from '../models/TodoUpdate';

// TODO: Implement businessLogic

const todoAccess = new TodosAccess();

export const createTodo = (userId: string, todo: CreateTodoRequest) => {

    const todoId = uuid.v4();
    const createdAt = new Date().toISOString();
    const done = false;
    const {name, dueDate} = todo;

    const newTodo: TodoItem = { todoId, userId, createdAt, done, name, dueDate };
  return todoAccess.createTodo(newTodo);
};

export const updateTodo = (userId: string, todoId: string, todoUpdateRequest: UpdateTodoRequest ) => {

    const todoUpdate = todoUpdateRequest
    return todoAccess.updateTodo(userId, todoId, todoUpdate);
};

export const getTodo = (userId: string, todoId: string) => {

    return todoAccess.getTodo(userId, todoId);
};

export const getTodos = (userId: string) => {

  return todoAccess.getTodos(userId);
};

export const deleteTodo = (userId: string, todoId: string) => {

  return todoAccess.deleteTodo(userId, todoId);
};

export const createAttachmentPresignedUrl = async (userId: string, todoId: string): Promise<string> => {

  const bucketName = process.env.ATTACHMENT_S3_BUCKET;
  const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION, 10);
  const signedUrl = AttachmentUtils(todoId, bucketName, urlExpiration)
  await todoAccess.saveImgUrl(userId, todoId, bucketName);
  return signedUrl;
}
