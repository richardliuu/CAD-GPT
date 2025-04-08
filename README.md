# Installing Backend packages

1. Create a virtual environment
2. Activate the virtual environment (Windows)

.venv\Scripts\activate

3. Go into the backend directory

cd cad-llm-backend

4. Install packages

pip install -r requirements.txt

# Installing Frontend Packages

1. Activate the virtual environment

.venv\Scripts\activate

2. Enter the frontend directory

cd cad-llm-frontend
cd cad-gpt

3. Install npm packages

npm install

# Running the frontend
1. Open a terminal 
2. Run the following commands 

cd cad-llm-frontend
cd cad-gpt

npm run dev

# Running the Backend
1. Open a terminal
2. Run the following commands 

cd cad-llm-backend

uvicorn main:app --reload

- A link to a local host server will appear 
- Click on the link to open the application on your browser 
- Once the app is running, enter a prompt into the input box!

