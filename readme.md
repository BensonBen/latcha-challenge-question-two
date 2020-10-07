<h1 align="center">Latcha Challenge Question Two</h1>
<p align="center">A domain driven REST API</p>
<p align="center">
	<img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
</p>

### Table of Contents

- [Summary](#summary)
- [Usage](#usage)
- [Architecture](#architecture)
- [Faults](#faults)
- [Extending the API](#suggestions)
- [API](#api)

## Summary

- :tada: Simple REST API for arbitrary products using SQL Lite, express, and Typescript.

## Architecture

# Domain Driven Design

<p>
    In the build of this API I've tried to stick to the tried and true <bold>Domain Driven Design</bold>. You can see this relfected in the way that the routing is setup. There is one controller per level of "business" logic, and there would have been services, validation, models, and other things specific to that area. However, in order to keep the project more bearable I've elected to not have a lot of the classic paradigm. Again, classically you'd have more files to segment out validation, conversion, database work and other things. However, due to time constraints and just other obligations I don't think I'll be able to segment out all of the possible logical avenues for this Domain Driven Rest API.
<p>

# Database

<p>
    For the database portion of the challenge I ended up using <bold>SQL Lite</bold>. Just for simplicity and usability. No reason to break out the heavy hardware. The schema of said Database tables is as follows. Very straight forward; however, most of the queries that I wrote to get information from the database where not used in an ORM fashion. Just for simplicity sake and time constraints.
<p>

`Create Schema Statement`

```sql
    CREATE TABLE IF NOT EXISTS Products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    color TEXT NOT NULL,
    name TEXT NOT NULL,
    retired INTEGER DEFAULT 0,
    size INTEGER DEFAULT 0,
    cost INTEGER DEFAULT 0
  );
```

`Find One on Primary Key`

```sql
    SELECT * FROM Users WHERE id=?;
```

`Find most recent insertion`

```sql
    SELECT * FROM Products WHERE id=(SELECT MAX(id) FROM Products);
```

`Create One`

```sql
    INSERT INTO Products (color, name, retired, size, cost) VALUES(?, ?, ?, ?, ?);
```

`Update One`

```sql
    UPDATE Products SET color=?, name=?, retired=?, size=?, cost=? WHERE id= ?;
```

`Delete One on Primary Key`

```sql
    DELETE FROM Products WHERE id=?;
```

# Routing

<p>
    The routing of the REST API is mainly inspired by DDD and as a developer. It's easiest to create a folder structure that reflects the actual URL paths for the API. In doing so, it keeps the endpoints logically seperated from one another.
<p>

# Dependency Injection

<p>
    I used TSyringe to perform a more modern dependency injection technique to the application. This is an attempt to lower the memory footprint of the application. As creating new instance of services can lead to complicated scenarios and extra memory.
<p>

# Validation

<p>
    In order to validate user requests that come in I'm using <bold>Joi</bold> listed below. For some very basic validation on the requests that users would make the API. This validation is <bold>not</bold> perfect by any means. But some validation goes a long ways.
<p>

- See [Typescript](https://www.typescriptlang.org/) for more information on Typescript.
- See [NodeJS](https://nodejs.org/) for more information on NodeJS.
- See [Chalk](https://github.com/chalk/chalk) for more information on Chalk.
- See [Body Parser Middleware](https://github.com/expressjs/body-parser) for more information on the body parser middleware.
- See [Cors](https://github.com/expressjs/cors#readme) for more information on the CORS Middleware for express.
- See [DotEnv](https://github.com/motdotla/dotenv) for more information on the environment variable loader.
- See [Express](https://github.com/expressjs/express) for more information on the http server that was used.
- See [Helmet](https://github.com/helmetjs/helmet) for more information on the potential security enhancements that could be used.
- See [Helmet](https://github.com/helmetjs/helmet) for more information on the potential security enhancements that could be used.
- See [Http-Status](https://github.com/adaltas/node-http-status) for more information on Standardized HTTP Statuses that were used.
- See [Joi](https://www.npmjs.com/package/joi) for more information on the validation that was done on user requests.
- See [Lodash](https://github.com/lodash/lodash) for more information on the boiler plate javascript utility functions that were used.
- See [Lodash](https://github.com/lodash/lodash) for more information on the boiler plate javascript utility functions that were used.
- See [Reflect-Metadata](https://github.com/rbuckton/reflect-metadata) for more information on how dependency injection was enabled in typescript.
- See [SQL Lite 3](https://github.com/mapbox/node-sqlite3) for more information on the in memory SQL Lite database that was used.
- See [TS Syring](https://github.com/Microsoft/tsyringe) for more information on the Dependency Injection tool I used.

## Usage

<bold>
    Make sure you're on at least NodeJS version `12.19.0 LTS`
</bold>
<bold>
    Simply Run `npm install && npm run local` which will fire up a HTTP server on localhost:3000 by default
</bold>

## Faults

<p>This is simply a curated this of the possible faults with the application and ways it could be improved</p>

- Problem: `This app is just asking to have a SQL Injection attack on it.`
- Solution: `Use an ORM, or in my opinion perhaps use GraphQL as that kills two birds with one stone.`

- Problem: `More thorough validation could be done to prevent errors being thrown. Perhaps this would also lead to performance gains as throwing an exception generally leads to extra CPU Time.`
- Solution: `Extract validation into its own service and unit test.`

- Problem: `Code wise the controller could be split up into more logical segments; such as, Validation, Database Access, Conversion.`
- Solution: `Extract smaller segments of the code base into other places and unit test. Use pre-existing dependency injection to combine resources`

- Problem: `The application currently only supports the HTTP protocol which is inherently more insecure than HTTPS`
- Solution: `Configure routes and express to use HTTPS`

- Problem: `Obviously there could be more testing done on the application to mitigate bugs`
- Solution: `Unit Test using Jest (the facebook unit testing suite)`

- Problem: `SQL Locks and Bad Data. Since a server is multi threaded its possible to get into a scenario where could be stale data.`
- Solution: `Use a transaction based approach to resolve multi threading issues.`

## Extending the APIs Current Capabilities

# Authentication

<p>
    Authentication would consist of entering in the user's credentials at a specific enpoint and from that endpoint the user could obtain a token. That token could then be passed with ever request where the server can verify that user is who they say they are. Additionally, there could be something as complicated a OAUTH 2.0. Where the user has a secret key, and there's actually two steps in authorizing a user to use endpoints. Again, at each endpoint there would need to be validation on the token passed.
</p>

# More endpoints

<p>
    Extending the API would consist of following the existing code structure and folder structure of the user controller that's currently availible.
    Adding in additonal routes and then combining those to their appropriate handlers. Using dependency injection to resovle those dependencies and creating new endpoints should be straight forward. However, there should be further segmentation of database logic, and more base services for duplicated logic.
</p>

## License

Licensed under the [MIT License]

```

```
