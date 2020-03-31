# De Redux à NGRX

### *[ Début de la branche step-1 ]*

Redux est un pattern déjà implémenté sur les principaux frameworks/librairies Javascript du moment.
Pour React  => **react-redux**
Pour Vue  => **vuex**
Pour Angular  => **NGRX**

Il est donc inutile de créer un store *from scratch*. 
Comme nous allons créer une application Angular, nous utiliserons **NGRX**.
Cette librairie est une implémentation "reduxienne", qui englobe une couche de **RXJS** .
Tout comme Angular, elle utilise les **Observables** pour communiquer la mise à jour des états dans les composants Angular.

## Installation

Pour démarrer, il faut utiliser la **version 5** d'Angular. 
Le CLI doit être  au dessus de la version **1.6.0** et doit donc avoir RXJS en version **5.5.6** pour utliser les derniers opérateurs disponibles.

Commençons par créer un nouveau projet Angular :
```shell
$ ng new ngrx-tutoriel-app --style=scss
```
Dans le dossier, rajouter **NGRX en version 5.0 et plus** :
```shell
$ npm install @ngrx/store ou yarn add @ngrx/store
```

## Architecture
Voici un exemple de schéma d'arborescence pour structurer nos dossiers :
```
app
│   app.component.ts
│   app.component.scss
│	app.component.html
│   app.module.ts  
└───store
│   │   index.ts
│   └───actions
│   │   │   exemple.action.ts
│   │   │   ...
│   └───reducers
│  	│   │   exemple.reducer.ts
│   │   │   ...
└───modules
```

## Commençons ! [ début du tutoriel ]

Pour changer de l'exemple du counter précédent, nous allons créer une **todolist**.
Faisons le point de ce que représente fonctionnellement une todo :
1. Récupération des todos -> **GET**
2. Création des todos -> **PUT**
3. Suppression des todos-> **DELETE**
4. Mise à jour des todos -> **PATCH / POST**


Tout d'abord, commençons par définir l'interface :

*models/todo.ts*
```typescript
// Interface de la todo
export interface Todo {
	userId: number;
	id: number;
	title: string;
	completed: boolean;
}

// Interface de notre futur state de todos
export interface TodoListState {
	data: Todo[];
	loading: boolean;
	loaded: boolean;
}
```
> Model utilisé par **[JsonPlaceholder](https://jsonplaceholder.typicode.com/)**.

 Créer ici un fichier pour *mocker* nos valeurs :

*mocks/todo-list-data.ts*
```javascript
export const todosMock = [{
    "userId": 1,
    "id": 1,
    "title": "delectus aut autem",
    "completed": false
  },
  {
    "userId": 1,
    "id": 2,
    "title": "quis ut nam facilis et officia qui",
    "completed": false
  },
  {
    "userId": 1,
    "id": 3,
    "title": "fugiat veniam minus",
    "completed": false
  },
  {
    "userId": 1,
    "id": 4,
    "title": "et porro tempora",
    "completed": true
  },
  {
    "userId": 1,
    "id": 5,
    "title": "laboriosam mollitia et enim quasi adipisci quia provident illum",
    "completed": false
  },
  {
    "userId": 1,
    "id": 6,
    "title": "qui ullam ratione quibusdam voluptatem quia omnis",
    "completed": false
  },
  {
    "userId": 1,
    "id": 7,
    "title": "illo expedita consequatur quia in",
    "completed": false
  }]
```

Créer l'action pour initialiser notre liste :

*store/actions/todo-list.action.ts*
```typescript
export namespace TodoListModule {

    export enum ActionTypes {
        INIT_TODOS = '[todoList] Init Todos'
    }

    export class InitTodos {
        readonly type = ActionTypes.INIT_TODOS;
    }

    export type Actions = InitTodos;
}
```
Il est préférable d'encapsuler le tout dans un **namespace** pour simplifier les *imports*.
Le dernier *export* **Actions** servira pour le typage du **reducer** uniquement :


*/store/reducers/todo-list.reducer.ts*
```typescript
import { TodoListModule } from '../actions/todo-list.action';
import { TodoListState  } from '../../models/todo';
import { todosMock } from '../../mocks/todo-list-data';

// les valeurs par défaut du state
const initialState: TodoListState = {
    data: [],
    loading: false,
    loaded: false
};

// la fonction reducer de la todo
export function todosReducer(
    state: TodoListState = initialState,
    action: TodoListModule.Actions
): TodoListState {

  switch (action.type) {
    // L'action de InitTodos
    case TodoListModule.ActionTypes.INIT_TODOS :
    return {
        ...state,
        data: [
            ...todosMock // Injecte le mock
        ]
    };

    default:
        return state;
    }
}
```
*store/index.ts*
```typescript
import { ActionReducerMap } from '@ngrx/store';
import { InjectionToken } from '@angular/core';

import { todosReducer } from './reducers/todo-list.reducer';
import { TodoListState } from '../models/todo';

// Le root reducer
const reducers = {
    todos: todosReducer
};

export interface AppState {
    todos: TodoListState;
}
// Nécéssaire pour l'AOT
export function getReducers() {
    return reducers;
}
// Nécéssaire pour l'AOT
export const REDUCER_TOKEN = new InjectionToken<ActionReducerMap<AppState>>('Registered Reducers');
```
Dans le fichier *index.ts*, on définit l'objet **reducers** qui contient notre **reducer** de todos, puis on ajoute une fonction **getReducers** qui renvoie cet objet :
 >Le mode Ahead of Time (AoT) compilation de Angular exige que tous les symboles référencés dans les métadonnées du décorateur soient analysables statiquement. 
 >Pour cette raison, nous ne pouvons pas insérer l'état à l'exécution avec AOT sauf si nous utilisons notre **reducers** en tant que fonction. 
 >
> Pour insérer les reducers dans votre application, utiliser une **InjectionToken** et un **Providers** pour enregistrer ceux-ci via l'insertion de dépendance.

*/app.module.ts*
```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule} from '@ngrx/store';
import { getReducers, REDUCER_TOKEN } from './store';
import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot(REDUCER_TOKEN)
  ],
  providers: [
    {
      provide: REDUCER_TOKEN,
      useFactory: getReducers
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```


>Pour finaliser la création du **Store**, utiliser le **StoreModule** et insérer le *token*.

Ajouter notre *state* de *todo* dans le *app.component.ts* via la fonction **select**.

*/app.component.ts*
```typescript
import { Store, select } from '@ngrx/store';
import { OnInit, Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TodoListModule } from './store/actions/todo-list.action';
import { AppState } from './store';
import { Todo } from './models/todo';


@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  template: `
    <h1>la todolist redux style !</h1>
    <ul>
		<li *ngFor="let todo of (todos$ | async)?.data">
			<label>{{ todo.title }}</label>
			<input type="checkbox" [value]="todo.completed"/>
			<button>Supprimer</button>
		</li>
	</ul>
  `
})
export class AppComponent implements OnInit {

  todos$: Observable<Todo[]>;

  constructor(
    private store: Store<AppState>
  ) {
    this.todos$ = store.pipe(select('todos'));

    /* A éviter
	this.todo$.subscribe((todos) => {
		this.todos = todos;
	});

    Dans ce cas de figure, pas de mutation sur la liste
    de todos dans le component, inutile de faire un subscribe.
    Cela évite également de faire un unsubscribe dans le OnDestroy
    et utiliser un *ngIf dans le <ul> dans le cas ou la donnée est vide.
	*/

  }

  ngOnInit() {
    this.store.dispatch(new TodoListModule.InitTodos());
  }

}

```
Vous devriez voir apparaître la liste des *todos*.

### [Suite >>](https://github.com/fausfore/ngrx-french-guide/blob/master/documentations/step-2.md)


<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE4MjE4MzA5ODhdfQ==
-->
