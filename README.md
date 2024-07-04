## ThemeAPI

This API is used to retrieve themes used for the [Theme Library](https://github.com/faf4a/ThemeLibrary).

---

# Endpoints

## Theme Related

Base: https://themes-delta.vercel.app/api

### `GET` **`/[theme]`**
Wants `theme` as `query`

- Returns information about a specific theme.

#### Example

```js
fetch("https://themes-delta.vercel.app/api/Monocord")
```

#### Returns

- Content-Type: `text/css`
- Returns 200, 404 or 405

```css
/**
* @name Monocord
* @author catpurrchino
* @description Discord Design based on the Monospace font
* @version 1.0.0
* @source https://github.com/faf4a/snippets
*/

@import url("https://raw.githubusercontent.com/Faf4a/snippets/main/Monocord/main.css");
```

### `GET` **`/thumbnail/[theme]`**
Wants `theme` as `query`

- Returns thumbnail from a theme.

#### Example

```js
fetch("https://themes-delta.vercel.app/api/thumbnail/Monocord")
```

#### Returns

- Content-Type: `image/png`, `image/gif` or `image/webp`
- Returns 200, 404 or 405

![preview](https://themes-delta.vercel.app/api/thumbnail/Monocord)

### `GET` **`/themes`**

- Returns all available themes.

#### Example

```js
fetch("https://themes-delta.vercel.app/api/themes")
```

#### Returns

- Content-Type: `application/json`
- Cache-Control: max-age=1200
- Returns 200 or 405

> [!NOTE]
> Content is encoded in Base64

```json
[
 {
  "id": Number,
  "name": String,
  "type": "theme" | "snippet",
  "description": String,
  "author": {
   "discord_snowflake": String | null,
   "discord_name": String | null,
   "github_name": String | null,
  },
  "tags": Array,
  "thumbnail_url": String,
  "release_date": Date,
  "guild": {
   "name": String | null,
   "invite_link": String | null,
   "snowflake": String | null,
  },
  "content": String,
  "source": String,
  "likes": Number
 }, {...}
]
```

### `GET` **`/likes/get`**

- Returns data about all liked themes.

#### Example

```js
fetch("https://themes-delta.vercel.app/api/likes/get")
```

#### Returns

- Content-Type: `application/json`
- Returns 200 or 405

```js
{
  "status": 200,
  "likes": [
    {
      "themeId": Number,
      "userIds": []
    },
    {
      "themeId": Number,
      "userIds": []
    },
    {...}
}
```

### `POST` **`/likes/add`**
Wants `token` (unique user token, **__DO NOT PASS YOUR DISCORD ACCOUNT TOKEN__**) and `themeId` in `body`.

- Adds likes to a given theme.
- Requires to be authorized.

#### Example

```js
fetch("https://themes-delta.vercel.app/api/likes/add", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ token: "", themeId: 0 })
})
```

#### Returns

- Content-Type: `application/json`
- Returns 200, 401, 405, 409, or 500.

```js
{
  "status": 200
}
```

### `POST` **`/likes/remove`**
Wants `token` (unique user token, **__DO NOT PASS YOUR DISCORD ACCOUNT TOKEN__**) and `themeId` in `body`.

- Removes likes from a given theme.
- Requires to be authorized.

#### Example

```js
fetch("https://themes-delta.vercel.app/api/likes/remove", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ token: "", themeId: 0 })
})
```

#### Returns

- Content-Type: `application/json`
- 200 or 405

```js
{
  "status": 200
}
```

### `POST` **`/submit/theme`**
Wants `token` (unique user token, **__DO NOT PASS YOUR DISCORD ACCOUNT TOKEN__**) and `content` in `body`.

- Removes likes from a given theme.
- Requires to be authorized.
- Content **must** be encoded in Base64, content must include metadata (name, author, description), can include others.

#### Example

```js
fetch("https://themes-delta.vercel.app/api/submit/theme", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ token: "", content: "" })
})
```

#### Returns

- Content-Type: `application/json`
- 200, 400 or 405

```js
{
  "status": 200
}
```

## Auth Related

Base: https://themes-delta.vercel.app/api/user

### `GET` **`/auth`**
Wants `code` as `query`

- Authenticates a user using their access token, this should be only done once. The token returned will be the "password" to your account.

Don't call the endpoint directly, it will return 401, use discord.

`https://discord.com/oauth2/authorize?client_id=1257819493422465235&response_type=code&redirect_uri=https://themes-delta.vercel.app/api/user/auth&scope=identify`

#### Example

```js
fetch("https://themes-delta.vercel.app/api/user/auth?code=ACCESS_TOKEN")
```

#### Returns

- Content-Type: `application/json`
- 200, 400 or 405

```js
{
  "status": 200,
  "token": "UNIQUE_USER_TOKEN"
}
```

### `POST` **`/findUserByToken`**
Wants `token` (unique user token, **__DO NOT PASS YOUR DISCORD ACCOUNT TOKEN__**) in `body`.

- Returns the user data based on the unique user token.

#### Example

```js
fetch("https://themes-delta.vercel.app/api/user/findUserByToken", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ token: "" })
})
```

#### Returns

- Content-Type: `application/json`
- 200, 401 or 405

```js
{
  "status": 200,
  "user": {
    "id": User["id"]
    "createdAt": Date
  }
}
```

### `DELETE` **`/revoke`**
Wants `token` (unique user token, **__DO NOT PASS YOUR DISCORD ACCOUNT TOKEN__**) and `userId` in `body`.

- Deletes user data associated with the token.

#### Example

```js
fetch("https://themes-delta.vercel.app/api/user/revoke", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ token: "", userId: "" })
})
```

#### Returns

- Content-Type: `application/json`
- 200, 401 or 405

```js
{
  "status": 200
}
```
