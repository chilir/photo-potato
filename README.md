
# Photo Potato

Hello, welcome to the repository for Photo Potato.

This toy photo uploading webapp is built with a React frontend and a Flask backend. Postgres is used for the database but is hotswappable with any database solutions supported by SQLAlchemy.

The Python backend environment is built with [Poetry](https://python-poetry.org/) as the dependency management system. The React frontend is bootstrapped with `create-react-app` and can be interfaced with `npm`.

## Starting the App

To start the client (default port 3003):
```bash
cd photo-potato-frontend
npm start
```

To start the backend server (default port 5002):
```bash
cd photo-potato-backend
flask run --port 5002
```

## Licensing
Please note that there is no license within this repo.
