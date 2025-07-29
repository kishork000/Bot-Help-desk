# **App Name**: SevaSphere

## Core Features:

- Chat Interface: Provides a React-based interface for interacting with the chatbot. It includes text input, message display, and controls to enhance user experience.
- API Backend: Utilizes Flask or FastAPI to create a REST API backend for handling chat requests.
- Intent Detection: Analyzes user input to determine the intent. Initially uses rule-based or keyword-matching logic; The reasoning LLM acts as a tool in intent determination and future versions could add intent recognition models.
- Database Integration: Integrates with MySQL databases to fetch FAQ data, PIN codes, village information, and scripts. Modules retrieve relevant data based on detected intent.
- Multilingual Support: Handles input in both Hindi and English. Integrates the existing Hindi transliteration app to normalize Hindi input before processing. Reasoning LLM uses it as a tool.
- Query Logging: Logs unknown queries to a local file for review and model improvement. Implemented to facilitate self-learning in future versions.
- Background Operation: Runs continuously in the background using systemd, nohup, or tmux. Provides scripts or commands to easily start and stop the chatbot service.

## Style Guidelines:

- Primary color: A calm blue (#5DADE2) representing reliability and trust, suitable for a service-oriented chatbot.
- Background color: Light grey (#F0F4F7) provides a clean, neutral backdrop to ensure readability and focus.
- Accent color: A muted purple (#A98DDE) complements the blue, adding a touch of innovation.
- Body and headline font: 'PT Sans', a humanist sans-serif that balances a modern feel with warmth and readability, making it excellent for both headlines and body text.
- Simple, clear icons to represent different database sources or types of queries, aiding quick visual understanding.
- Clean and modular layout for the chat interface and settings, emphasizing ease of use and quick access to information.
- Subtle animations (e.g., typing indicators, message received animations) to provide feedback and improve user engagement without being distracting.