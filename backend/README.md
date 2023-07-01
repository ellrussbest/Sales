# How to use the application

- Clone/download the file from github
- Run `npm install` to install the dependencies
- Run `npm run build` to compile the packages
- Run `npm start` to start the server
- Test the server functionality using <strong> Postman </strong>
- On the backend root's directory set up a `.env` file and this will have configuration to your database and other security things
- This is how it should look like:

```
    // Mongo
    CONNECTION_STRING=mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.srquefs.mongodb.net/<DATABASE>?retryWrites=true&w=majority

    // jwt secret private API_KEY
    SECRET=just_input_any_string_that_is_hard_to_guess
```
- For you to test the functionality of product uploads or delete, on the root directory create uploads/images/ folder
- Now your good to go <strong> Have Fun!!! </strong>