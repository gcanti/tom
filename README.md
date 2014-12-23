# Action

An action is specified by 3 props:

- name: Str
- args: ```{
    params: Obj,
    query: Obj,
    body: ?Obj
  }```
- path: Str (alias)

Examples:

- **function**: `getProjects({params: {userId: 1}})`
  - name: 'getProjects'
  - args: {params: {userId: 1}}
- **link**: GET /users/1/projects
  - path: 'GET /users/:userId/projects'
  - args: {params: {userId: 1}}
- **JSON**: `{name: 'getProjects', args: {params: {userId: 1}}`

Action definition:

```
var action = {
  name: 'getProjects',
  args: {
    params: {
      userId: Str
    }
  },
  path: 'GET /users/:userId/projects'
}
```

# Action trigger

There are several (equivalent) triggers:

- links: `<a href="/users/1/projects">My projects</a>`
- forms: `<form action="/users/1/project">...</form>`
- function call: `getProjects({params: {userId: 1})`
- dispatcher call: `dispatch({name: 'getProjects', args: {params: {userId: 1}})`

# Flow

## Link

- js disabled: request goes to server
- js enabled: request intercepted -> tom call

## Form

- js disabled: request goes to server
- js enabled: request intercepted -> tom call

## Function call (js enabled)

- GET: request converted to url -> change url -> request intercepted -> app call
- POST: request converted to url -> tom call
