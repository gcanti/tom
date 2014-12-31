# Action

An *action* is specified by 2 props:

- name: Str
- args: ?Obj. Split in 3 groups:
  - params: ?Obj
  - query: ?Obj
  - body: ?Obj
- method: "GET" | "POST"
- path: Str

Examples:

**function**

```js
getProjects({params: {userId: 1}, query: {sort: 'asc'}})
```

Where:

- name: 'getProjects'
- args: `{params: {userId: 1}, query: {sort: 'asc'}}`

**link**

```
GET /users/1/projects?sort=asc
```

Where:

- method: `GET`
- path: `/users/:userId/projects'`
- args: `{params: {userId: 1}, query: {sort: 'asc'}}`

# Action trigger

There are several (equivalent) triggers:

- links: `<a href="/users/1/projects?sort=asc">My projects</a>`
- forms: `<form method="POST" action="/users/1/project?sort=asc">...</form>`
- function call: `getProjects({params: {userId: 1}, query: {sort: 'asc'}})`

# Flow

## Link

- js disabled: request goes to server
- js enabled: request intercepted -> location.push(url)

## Form

- js disabled: request goes to server
- js enabled: request intercepted -> location.post(url, body)

## Function call (js enabled)

- GET: location.push(url)
- POST: location.post(url, body)

# Location

```
addChangeListener(listener: Func)
removeChangeListener(listener: Func)
get(url: Str)
post(url: Str, body: ?Obj);
```

Listeners will receive the following event:

# RequestEvent

```js
{
  "method": "GET" | "POST",
  "url": Str,
  "body": ?Obj
}
```

# Utils

```js
toUrl(path, {params: ?Obj, query: ?Obj})
```

```js
on(eventName, handler)
off(eventName, handler)
```

# App

- handle(evt: RequestEvent)
