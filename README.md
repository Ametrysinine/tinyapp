# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

![URL directory](https://github.com/Ametrysinine/tinyapp/blob/master/docs/urlView.png?raw=true)
![Built-in editor](https://github.com/Ametrysinine/tinyapp/blob/master/docs/urlEdit.png?raw=true)


## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Features

- Shorten URLs into a format that can be used by anyone! 
> (as long as the server is running)
- Change/delete URLs at a later date (user identification required)! 
> (does not come with email verification)
- Hash protection for user passwords! 
> (user information fully deleted when server goes down)