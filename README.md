<div align="center">
  <img width="389" height="422" alt="image-removebg-preview" src="https://github.com/user-attachments/assets/c4cdfee8-f68e-4d04-a8d9-d4323ce132f1" alt="Logo" width="120" height="120" />
   
  <h1 align="center">LegalEase AI ⚖️</h1>
  <p align="center">
    AI-powered legal notice generation, translation, and management.
    <br />
    <a href="#about-the-project"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://legal-ease-ai-eight.vercel.app/">View Demo</a>
    ·
    <a href="https://github.com/vanshika1729/Legal_Ease_AI/issues">Report Bug</a>
    ·
    <a href="https://github.com/vanshika1729/Legal_Ease_AI/issues">Request Feature</a>
  </p>
</div>

<div align="center">

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white)

</div>

---

## About The Project

LegalEase AI is a full-stack web application designed to simplify the creation and management of legal notices. Leveraging the power of Google's Gemini AI, it allows users to generate professional legal documents from simple descriptions, translate them into multiple languages, and manage them through a secure, authenticated interface.

This project was built to address the complexity and cost associated with drafting legal documents, providing an intuitive and accessible solution for individuals and small businesses.

---

## ✨ Features

* **🤖 AI-Powered Generation**: Describe your issue, and the AI generates a formal, legally sound notice.
* **🌐 Multi-Language Translation**: Seamlessly translate generated notices into various languages using Google Cloud Translate.
* **🔒 Secure Authentication**: Robust user registration and login system using JWT (JSON Web Tokens).
* **🗂️ Notice Management**: Save, view, and delete your generated notices in a personal, secure dashboard.
* **📄 PDF Export**: Export your final legal notices as professionally formatted PDF documents.
* **🚀 Modern Tech Stack**: Built with a responsive React frontend and a powerful FastAPI backend.

---

## 🛠️ Tech Stack

The application is built with a modern, decoupled architecture.

| Frontend                                                                                                                              | Backend                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)                            | ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)                                                                                                           |
| ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)            | ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)                                                                                             |
| ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)                                  | ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) & ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white) |
| ![Axios](https://img.shields.io/badge/axios-2B2B2B?style=for-the-badge&logo=axios&logoColor=white)                                      | ![Gunicorn](https://img.shields.io/badge/gunicorn-%29A646?style=for-the-badge&logo=gunicorn&logoColor=white) & ![Uvicorn](https://img.shields.io/badge/uvicorn-238B94?style=for-the-badge&logo=uvicorn&logoColor=white) |

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js & npm
    ```sh
    npm install npm@latest -g
    ```
* Python 3.9+
* An active Google Cloud account with the Gemini and Cloud Translate APIs enabled.

### Installation

1.  **Clone the repo**
    ```sh
    git clone [https://github.com/vanshika1729/Legal_Ease_AI.git](https://github.com/vanshika1729/Legal_Ease_AI.git)
    cd Legal_Ease_AI
    ```

2.  **Backend Setup**
    * Navigate to the backend directory and create a virtual environment:
        ```sh
        cd backend
        python -m venv venv
        source venv/bin/activate  # On Windows: venv\Scripts\activate
        ```
    * Install Python dependencies:
        ```sh
        pip install -r requirements.txt
        ```
    * Create a `.env` file in the `backend` directory and add your credentials:
        ```env
        SECRET_KEY="YOUR_SUPER_SECRET_KEY"
        GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
        # You also need to set up Google Application Credentials for translation
        ```
    * Run the backend server:
        ```sh
        uvicorn main:app --reload
        ```

3.  **Frontend Setup**
    * Navigate to the frontend directory:
        ```sh
        cd ../frontend
        ```
    * Install NPM packages:
        ```sh
        npm install
        ```
    * Start the frontend development server:
        ```sh
        npm start
        ```

---



<p align="center">
  #<img width="2559" height="1479" alt="image" src="https://github.com/user-attachments/assets/3b82df86-f66b-4c2e-8008-a16a7515052d" />
</p>

---

## ☁️ Deployment

This application is deployed using a hybrid cloud strategy for optimal performance and cost-efficiency:

* **Frontend**: The React application is deployed as a static site on **[Vercel](https://vercel.com/)**, leveraging its global CDN for fast load times.
* **Backend**: The FastAPI server and PostgreSQL database are hosted on **[Render](https://render.com/)**, which provides a reliable and scalable environment for the application logic.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
