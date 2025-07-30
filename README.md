# Bot Help-desk: AI Assistant for Public Services

This is a Next.js application for an intelligent, AI-powered chatbot designed to assist users with information about public services. It features a sophisticated admin panel for content management, user interaction review, and system configuration.

The application is built with a modern tech stack including Next.js, TypeScript, Tailwind CSS, ShadCN for UI components, and Genkit for the core AI capabilities.

## Table of Contents

- [Core Features](#core-features)
- [Application Architecture](#application-architecture)
  - [AI Chatbot Core](#ai-chatbot-core)
  - [Admin Panel](#admin-panel)
  - [Database](#database)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [How to Use](#how-to-use)
  - [Chatbot Interface](#chatbot-interface)
  - [Admin Panel](#admin-panel-1)
    - [Logging In](#logging-in)
    - [Content Management](#content-management)
    - [Database Management](#database-management)
    - [API Management](#api-management)
- [Future Enhancements](#future-enhancements)

## Core Features

- **Intelligent Chatbot**: A user-friendly chat interface where users can ask questions in natural language.
- **Tool-Based AI**: The AI uses a set of specialized "tools" to answer different types of queries, making it more accurate and reliable than a general-purpose model.
- **Secure Admin Panel**: A password-protected admin dashboard to manage all aspects of the application.
- **Comprehensive Content Management**: A full-featured UI to manage the chatbot's knowledge base, including:
    - **FAQs**: Add, edit, and search frequently asked questions.
    - **PIN Codes**: Manage location-specific information tied to 6-digit PIN codes.
    - **Media Library**: Upload and categorize images and videos that the chatbot can share with users.
    - **Custom Scripts**: Create rich, formatted guides and articles (with images) for more detailed user support.
- **Continuous Learning Loop**: The system logs questions the AI can't answer from its knowledge base, allowing admins to review them, add the correct answers, and continuously improve the chatbot's performance.
- **Configurable Connections**: UI for managing connections to databases and external APIs.

## Application Architecture

### AI Chatbot Core

The heart of the application is an AI agent built with **Genkit**. It uses an intent-driven, tool-based architecture.

1.  **User Query**: A user sends a message.
2.  **Intent Analysis (`answerUserQuery` flow)**: The message is first sent to the main AI prompt (`answerUserQueryPrompt`). This prompt's primary job is to analyze the user's intent and decide which specialized tool is best suited to handle the request. It does **not** answer the question directly at this stage.
3.  **Tool Execution**: Based on the AI's decision, the system executes one of the following tools:
    - `findFaqTool`: Searches the FAQ database for relevant questions and answers.
    - `findPinCodeInfoTool`: Looks up information in the PIN code database.
    - `findMediaTool`: Searches the media library for categorized videos and images.
    - `tellJokeTool`: Tells a family-friendly joke.
4.  **Response Generation**:
    - **If a tool finds an answer**: The result from the tool is used to formulate the final response to the user.
    - **If no tool is suitable or no result is found**: The system falls back to a general knowledge prompt (`answerGeneralQuestion`). This AI-generated answer is sent to the user, and the conversation is logged in the "Unanswered Conversations" table for admin review.

This architecture makes the chatbot highly efficient, accurate, and extensible.

### Admin Panel

The admin panel is a secure Next.js application that provides a central hub for managing the chatbot.

- **Authentication**: Implemented using Next.js middleware and secure, HttpOnly cookies. All routes under `/admin/*` are protected.
- **Content Management (`/admin/content`)**: A tabbed interface for managing all knowledge base content. It includes forms, dialogs, and tables for a seamless admin experience.
- **Connection Management (`/admin/databases`, `/admin/apis`)**: UI for configuring connections to databases (SQLite, PostgreSQL, MySQL, MongoDB) and external APIs.

### Database

The application uses a **SQLite** database by default, which is created automatically in the file `database.db`. The database schema is defined and initialized in `src/lib/db.ts`.

The schema includes the following tables:
- `faqs`: For frequently asked questions.
- `pincodes`: For location-based information.
- `media`: For categorized videos and images.
- `scripts`: For long-form, formatted articles.
- `unanswered_conversations`: For the continuous learning loop.

The system is designed to be database-agnostic, and the UI supports adding credentials for other databases like PostgreSQL or MySQL.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd <project_directory>
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Configuration

1.  **Create an Environment File**: Rename the `.env.example` file to `.env`.
2.  **Set Your Gemini API Key**: Open the `.env` file and replace `"YOUR_GEMINI_API_KEY_HERE"` with your actual Gemini API key.
    ```
    GEMINI_API_KEY=AIzaSy...
    ```
3.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
The application will be available at `http://localhost:9002`.

## How to Use

### Chatbot Interface

- Navigate to the home page (`http://localhost:9002`).
- Type questions in natural language (e.g., "How do I apply for a ration card?").
- Ask for media (e.g., "show me a sehat video").
- Enter a 6-digit PIN code to get local information.
- Click on video or image links to view them in a popup window.

### Admin Panel

#### Logging In

1.  Navigate to `http://localhost:9002/login`.
2.  Enter the default credentials:
    - **Email**: `admin@example.com`
    - **Password**: `password`
3.  You will be redirected to the admin dashboard at `/admin`.

#### Content Management

- Navigate to **Content** in the admin sidebar.
- **Unanswered Queries**: Review questions the chatbot couldn't answer. You can delete them or use the "Categorize" button to turn them into new FAQs, PIN code entries, or media items.
- **FAQs**: Add, edit, or delete FAQs.
- **PIN Codes**: Manage location-specific information.
- **Media**: Add new videos and images, including a title, type, category, and URL.
- **Scripts**: Create and manage rich, formatted articles with titles, categories, images, and Markdown content.

#### Database Management

- Navigate to **Databases** in the admin sidebar.
- View your existing database connections.
- Click "Add Connection" to open a form where you can add credentials for new databases (PostgreSQL, MySQL, MongoDB).

#### API Management

- Navigate to **APIs** in the admin sidebar.
- This section is a placeholder for you to manage connections to external third-party APIs in the future.

## Future Enhancements

- **Full CSV Upload Implementation**: Build the backend API route to handle parsing and importing data from CSV files for FAQs and PIN codes.
- **Local File Uploads**: Implement the server-side logic to handle file uploads from the "Add Media" dialog, storing them in the `public` directory.
- **Script Display**: Create a user-facing page to display the formatted "Custom Scripts" when a user requests one.
- **Multi-Database Support**: Implement the connection logic in `src/lib/db.ts` to dynamically switch between different database types based on the admin configuration.

    