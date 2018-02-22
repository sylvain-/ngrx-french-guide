import { ActionReducerMap } from '@ngrx/store';
import { InjectionToken } from '@angular/core';

import { todosReducer } from './reducers/todo-list.reducer';
import { TodoListState } from '../models/todo';
import { TodoListEffects } from '@Effects/todo-list.effect';

const reducers = {
    todos: todosReducer
};

export const appEffects = [TodoListEffects];

export interface AppState {
    todos: TodoListState;
}

export function getReducers() {
    return reducers;
}

export const REDUCER_TOKEN = new InjectionToken<ActionReducerMap<AppState>>('Registered Reducers');
