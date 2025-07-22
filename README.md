# Vanice-ts

Typescript implementation for https://github.com/mikeobank/vanice

## Compile

```
deno compile --output vanice --include ./src/worker.ts ./src/main.ts
```

## Run

```
deno run --allow-read src/main.ts { vanity name }
./vanice { vanity name }
```

## Development

```
deno lint
deno test
```
